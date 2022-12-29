import { IConfigDTO } from './IConfigDTO';
import { IFileProcessor } from './IFileProcessor';

import { File } from './File';

/**
 * Class ConfigModuleType
 */
export class ConfigModuleType implements IConfigDTO {
	public path?: string;
	public mime!: string;
	public processors: string[] = [];

	private _files: File[] = [];

	/**
	 * Hook for DTO processing
	 */
	public DTOInit(): void { }

	/**
	 * @param file
	 */
	public FileAdd (file: File) {
		this._files.push(file);

		return this;
	}

	/**
	 * Getter for file list
	 */
	public FileList (): File[] {
		return this._files;
	}

	/**
	 * @param processors
	 */
	public CompileOutput (processors: IFileProcessor[] = []): string {
		let out = '';
		let i = 0;

		while (i < this._files.length) {
			out += this._files[i].Load(processors).content;

			i++;
		}

		return out;
	}
}