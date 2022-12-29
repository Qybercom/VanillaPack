import * as fs from 'fs';

import * as mime from 'mime-types';

import { IFileProcessor } from './IFileProcessor';

/**
 * Class File
 */
export class File {
	public location?: string;
	public mime?: string;
	public content = '';

	private _loaded = false;

	/**
	 * @param location
	 */
	public constructor(location: string) {
		this.location = location;
		this.mime = mime.lookup(this.location) as string;
	}

	/**
	 * Content loader
	 */
	public get Content (): string {
		return fs.readFileSync(this.location as string, 'utf8');
	}

	/**
	 * @param processors
	 */
	public Load (processors: IFileProcessor[] = []) {
		if (!this._loaded) {
			this._loaded = true;
			this.content = this.Content;
		}

		let i = 0;
		while (i < processors.length) {
			this.content = processors[i].Process(this.content);

			i++;
		}

		return this;
	}
}