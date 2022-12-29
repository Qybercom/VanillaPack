import { IConfigDTO } from './IConfigDTO';
import { ConfigModule } from './ConfigModule';

/**
 * Class Config
 */
export class Config implements IConfigDTO {
	public modules: {
		[key: string]: {
			input: ConfigModule,
			output: ConfigModule
		}
	} = {};

	/**
	 * Hook for DTO processing
	 */
	public DTOInit (): void {
		let key: string;

		for (key in this.modules) {
			this.modules[key].input = Object.assign(new ConfigModule(), this.modules[key].input);
			this.modules[key].input.DTOInit();

			this.modules[key].output = Object.assign(new ConfigModule(), this.modules[key].output);
			this.modules[key].output.DTOInit();
		}
	}
}