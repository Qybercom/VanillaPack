// https://javascript.plainenglish.io/how-to-create-your-own-cli-with-node-js-9004091a64d5

import * as fs from 'fs';
import { Stats } from 'fs';

import arg from 'arg';

import { IFileProcessor } from './IFileProcessor';
import { Config } from './Config';
import { File } from './File';
import { UglifyJS } from './processors/UglifyJS';
import { UglifyCSS } from './processors/UglifyCSS';

export type Args = string[];
export type RawOptions = {
	test: boolean;
	config: string;
}

/**
 * Class Application
 */
export class Application {
	public static readonly CWD = process.cwd();
	public static readonly DEFAULT_CONFIG = Application.Path('vanilla-pack.config.json');
	public static readonly DEFAULT_ROOT = '*';

	private _processors: IFileProcessor[] = [];

	/**
	 * @param path
	 */
	public static Path (path = ''): string {
		if (path.substr(0, 1) === '/') return path;

		if (path.substr(0, 2) === './')
			path = path.substr(2);

		return Application.CWD + '/' + path;
	}

	/**
	 * @param path
	 */
	public static PathIsDirectory (path = '') {
		return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
	}

	/**
	 * @param path
	 * @param exclude
	 * @param type
	 */
	public static FileSystem (path: string, exclude: string[] = [], type?: (file: File) => boolean): string[] {
		let out: string[] = [];
		let add = true;
		let file: File | null = null;

		try {
			if (!Application.PathIsDirectory(path)) {
				add = true
				file = new File(path);

				if (type !== undefined)
					add = type(file);

				if (add)
					out.push(path);
			}
			else fs.readdirSync(path).forEach((fileRaw) => {
				const _path = path + '/' + fileRaw;
				const stats: Stats = fs.lstatSync(_path);

				if (exclude.length !== 0 && exclude.indexOf(_path) !== -1) return;

				if (stats.isDirectory()) out = out.concat(Application.FileSystem(_path, exclude));
				else {
					add = true;
					file = new File(_path);

					if (type !== undefined)
						add = type(file);

					if (add)
						out.push(_path);
				}
			});
		}
		catch (e) {
			console.log('No such path', path, e);
		}

		return out;
	}

	/**
	 * @param path
	 */
	public static Config (path: string): Config | null {
		try {
			const raw = fs.readFileSync(path, 'utf8');

			try {
				let out = Object.assign(new Config(), JSON.parse(raw));
				out.DTOInit();

				return out;
			}
			catch (e) {
				console.log('Cannot parse config at "' + path + '"');

				return null;
			}
		}
		catch (e) {
			console.log('Cannot retrieve config at "' + path + '"');

			return null;
		}
	}

	private _args = {
		'--test': Boolean,
		'-t': '--test'
	};

	/**
	 * @param args
	 */
	public Main (args: Args): void {
		this.Processors.push(new UglifyJS());
		this.Processors.push(new UglifyCSS());

		const options = this.Arguments(args);

		const config = Application.Config(options.config) as Config;

		let key = '';
		let i = 0;
		let j = 0;
		let path = '';
		let pathBuffer = '';
		let pathExclude: string[] = [];
		let out = '';
		let processors: IFileProcessor[] = [];

		for (key in config.modules) {
			path = Application.Path(config.modules[key].input.path as string);

			pathExclude = [];

			if (config.modules[key].input.exclude !== undefined) {
				i = 0;

				while (i < config.modules[key].input.exclude.length) {
					pathExclude.push(Application.Path(config.modules[key].input.exclude[i]));

					i++;
				}
			}

			Application.FileSystem(path, pathExclude, (file: File): boolean => {
				let i = 0;
				let out = true;

				while (i < config.modules[key].input.types.length) {
					if (config.modules[key].input.types[i].mime === file.mime) {
						config.modules[key].input.types[i].FileAdd(file);

						console.log('Input: "' + file.location + '"');
					}

					i++;
				}

				return out;
			});

			i = 0;
			while (i < config.modules[key].input.types.length) {
				processors = this.ProcessorList(config.modules[key].input.types[i].processors);

				config.modules[key].input.types[i].CompileOutput(processors);

				i++;
			}

			if (config.modules[key].output.path === undefined) continue;

			path = Application.Path(config.modules[key].output.path as string);

			if (fs.existsSync(path)) {
				if (fs.statSync(path).isFile()) {
					console.log('Can not write to "' + path + '", the path is not a directory');

					break;
				}
			}
			else {
				fs.mkdirSync(path);
			}

			i = 0;
			while (i < config.modules[key].output.types.length) {
				pathBuffer = path + '/' + config.modules[key].output.types[i].path;
				out = '';

				j = 0;
				while (j < config.modules[key].input.types.length) {
					if (config.modules[key].output.types[i].mime === config.modules[key].input.types[j].mime) {
						processors = this.ProcessorList(config.modules[key].output.types[i].processors);

						out += config.modules[key].input.types[j].CompileOutput(processors);
					}

					j++;
				}

				try {
					fs.writeFileSync(pathBuffer, out);

					console.log('Output: "' + pathBuffer + '", size: ' + out.length);
				}
				catch (e) {
					console.log('Cannot write results to "' + pathBuffer + '"');
				}

				i++;
			}
		}
	}

	/**
	 * @param argsRaw
	 */
	public Arguments (argsRaw: Args): RawOptions {
		const args = arg(this._args, {
			argv: argsRaw.slice(2)
		});

		return {
			test: args['--test'] == undefined ? false : args['--test'],
			config: args._[0] || Application.DEFAULT_CONFIG
		};
	}

	/**
	 * Getter for processor list
	 */
	public get Processors(): IFileProcessor[] {
		return this._processors;
	}

	/**
	 * @param ids
	 */
	public ProcessorList(ids: string[]): IFileProcessor[] {
		return this._processors.filter((value: IFileProcessor) => ids.indexOf(value.ID) !== -1);
	}
}