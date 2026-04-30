import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from '@dab/backend/modules/config/env.schema';
import { EnvService } from '@dab/backend/modules/config/env.service';

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: (config) => envSchema.parse(config),
		}),
	],
	providers: [EnvService],
	exports: [EnvService],
})
export class AppConfigModule {}
