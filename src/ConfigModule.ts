import { IConfigDTO } from './IConfigDTO';
import { ConfigModuleType } from './ConfigModuleType';

/**
 * Class ConfigModule
 */
export class ConfigModule implements IConfigDTO {
	public path?: string;
	public exclude: string[] = [];
	public types: ConfigModuleType[] = [];

	/**
	 * Hook for DTO processing
	 */
	public DTOInit(): void {
		let i = 0;

		while (i < this.types.length) {
			this.types[i] = Object.assign(new ConfigModuleType(), this.types[i]);
			this.types[i].DTOInit();

			i++;
		}
	}
}