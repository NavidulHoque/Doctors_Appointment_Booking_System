import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async handleUploads(files: Express.Multer.File[]) {
    const uploads: UploadApiResponse[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const isImage = /jpeg|jpg|png|gif/.test(ext);
      const publicId = path.parse(file.filename).name;
      const folder = `${file.fieldname}s`;

      const upload = isImage
        ? await this.cloudinary.uploadImage(file.path, publicId, folder)
        : await this.cloudinary.uploadVideo(file.path, publicId, folder);

      uploads.push(upload);
    }

    return uploads;
  }
}
