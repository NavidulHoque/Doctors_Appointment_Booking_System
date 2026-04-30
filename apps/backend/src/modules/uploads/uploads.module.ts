import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { UploadsService } from '@dab/backend/modules/uploads/uploads.service';
import { UploadsController } from '@dab/backend/modules/uploads/uploads.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UploadsService],
	controllers: [UploadsController],
})
export class UploadsModule {}
