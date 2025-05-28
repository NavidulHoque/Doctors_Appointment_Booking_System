// src/uploads/uploads.controller.ts
import {
  Controller,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer.config';
import { CloudinaryService } from './cloudinary.service';
import { UploadsService } from './uploads.service';

@Controller('upload')
export class UploadsController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly uploadsService: UploadsService
  ) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }], multerOptions))
  async handleUpload(
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    const uploads = await this.uploadsService.handleUploads(files);

    return {
      message: 'Upload successful',
      uploads: uploads.map((u, i) => ({
        url: u.secure_url,
        resource_type: u.resource_type,
        field: files[i].fieldname,
      })),
    };
  }
}
