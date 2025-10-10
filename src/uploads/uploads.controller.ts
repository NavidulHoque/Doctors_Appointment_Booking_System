import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer.config';
import { UploadsService } from './uploads.service';
import { AuthGuard, CsrfGuard, RolesGuard } from 'src/auth/guard';
import { Roles, User } from 'src/auth/decorators';
import { Role } from '@prisma/client';

@UseGuards(CsrfGuard, AuthGuard, RolesGuard)
@Controller('upload')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService
  ) { }

  @Post("avatarImage")
  @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  uploadAvatarImage(
    @UploadedFile() file: Express.Multer.File,
    @User("id") userId: string
  ) {
    return this.uploadsService.uploadAvatarImage(file, userId);
  }
}
