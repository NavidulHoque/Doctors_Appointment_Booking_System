import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

@Injectable()
export class CloudinaryService {
    async uploadImage(
        filePath: string,
        public_id: string,
        folder: string,
    ): Promise<UploadApiResponse> {

        try {
            const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
                public_id,
                folder,
                resource_type: 'image',
            });

            return result;
        } 
        
        catch (error: any) {
            throw new Error(`Image upload failed: ${error.message}`);
        }

        finally {
            await fs.promises.unlink(filePath);
        }
    }

    async uploadVideo(
        filePath: string,
        public_id: string,
        folder: string,
    ): Promise<UploadApiResponse> {
        try {
            const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
                public_id,
                folder,
                resource_type: 'video',
                eager_async: true,
            });

            return result;
        } 
        
        catch (error: any) {
            throw new Error(`Video upload failed: ${error.message}`);
        }

        finally {
            await fs.promises.unlink(filePath);
        }
    }

    async delete(public_id: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(public_id, {
                resource_type: 'auto',
            });
        } 
        
        catch (error: any) {
            throw new Error(`Cloudinary delete failed: ${error.message}`);
        }
    }
}
