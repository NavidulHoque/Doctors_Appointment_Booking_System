import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { CloudinaryService } from './cloudinary.service';
import { UploadsService } from './uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [CloudinaryService, UploadsService]
})
export class UploadsModule {}
