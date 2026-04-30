import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	User, Session, Doctor, Appointment, Payment, Message, Notification, Review,
} from '@dab/database';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { DatabaseService } from '@dab/backend/modules/database/database.service';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [EnvService],
			useFactory: (env: EnvService) => ({
				type: 'postgres',
				url: env.databaseUrl,
				synchronize: false,
				entities: [User, Session, Doctor, Appointment, Payment, Message, Notification, Review],
			}),
		}),
	],
	providers: [DatabaseService],
	exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}
