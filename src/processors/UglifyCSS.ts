import * as _lib from 'uglifycss';

import { IFileProcessor } from '../IFileProcessor';

/**
 * Class UglifyCSS
 */
export class UglifyCSS implements IFileProcessor {
	/**
	 * Getter for processor ID
	 */
	public get ID(): string {
		return '@uglifyCSS';
	}

	/**
	 * @param content
	 */
	public Process(content: string): string {
		return _lib.processString(content);
	}
}