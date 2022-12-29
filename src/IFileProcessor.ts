/**
 * Interface IFileProcessor
 */
export interface IFileProcessor {
	/**
	 * Getter for processor ID
	 */
	get ID(): string;

	/**
	 * @param content
	 */
	Process(content: string): string;
}