import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';

const uploadDir: string = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const multerOptions = {
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};

export const uploadFields = multer(multerOptions).fields([
  { name: 'video', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);
