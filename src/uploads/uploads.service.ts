import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService
  ) { }

  async uploadAvatarImage(file: Express.Multer.File, userId: string) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = /jpeg|jpg|png|gif/.test(ext);

    if (!isImage) {
      throw new BadRequestException('Only image files are allowed!');
    }

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
}
