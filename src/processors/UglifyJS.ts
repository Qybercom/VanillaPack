import * as _lib from 'uglify-js';

import { IFileProcessor } from '../IFileProcessor';

/**
 * Class UglifyJS
 */
export class UglifyJS implements IFileProcessor {
	/**
	 * Getter for processor ID
	 */
	public get ID(): string {
		return '@uglifyJS';
	}

	/**
	 * @param content
	 */
	public Process (content: string): string {
		return _lib.minify(content, { warnings: true }).code;
	}
}