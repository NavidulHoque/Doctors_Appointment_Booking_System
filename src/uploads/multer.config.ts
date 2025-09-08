import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';

const uploadDir: string = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const multerOptions: multer.Options = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const fileType = file.mimetype.startsWith('video') ? 'videos' : 'images';
      const filePath = path.join(uploadDir, fileType);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      cb(null, filePath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${path.parse(file.originalname).name}-${uniqueSuffix}${path.extname(
          file.originalname,
        )}`,
      );
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
};
