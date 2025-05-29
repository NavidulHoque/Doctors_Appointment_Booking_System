import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { CloudinaryService } from './cloudinary.service';
import { UploadsService } from './uploads.service';
import { CommonModule } from 'src/common/common.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [CommonModule, ConfigModule, PrismaModule],
  controllers: [UploadsController],
  providers: [CloudinaryService, UploadsService]
})
export class UploadsModule {}
