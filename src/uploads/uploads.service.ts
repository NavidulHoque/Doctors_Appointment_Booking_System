import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import * as path from 'path';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly handleErrorsService: HandleErrorsService,
    private readonly prisma: PrismaService
  ) { }

  async uploadAvatarImage(file: Express.Multer.File, userId: string) {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = /jpeg|jpg|png|gif/.test(ext);

      if (!isImage) this.handleErrorsService.throwBadRequestError('Only image files are allowed');

      const publicId = path.parse(file.filename).name;
      const folder = `images`;

      const upload = await this.cloudinary.uploadImage(file.path, publicId, folder);

      await this.prisma.user.update({
        where: { id: userId },
        data: { avatarImage: upload.secure_url },
      });

      return {
        message: 'Avatar image upload successful',
        data: upload.secure_url
      };
    }

    catch (error) {
      this.handleErrorsService.handleError(error);
    }
  }
}
