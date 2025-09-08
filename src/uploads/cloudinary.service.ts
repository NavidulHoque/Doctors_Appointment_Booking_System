import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async upload(
        file: string | Buffer,
        public_id: string,
        folder: string,
        resource_type: 'image' | 'video' | 'raw' | 'auto' = 'auto',
    ): Promise<UploadApiResponse> {
        try {
            this.logger.log(`Uploading file → folder: ${folder}, public_id: ${public_id}, type: ${resource_type}`);

            if (typeof file === 'string') {
                // File path upload
                return await cloudinary.uploader.upload(file, {
                    public_id,
                    folder,
                    resource_type,
                });
            } 
            
            else {
                // Buffer upload
                return await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { public_id, folder, resource_type },
                        (error, result) => {
                            if (error) {
                                this.logger.error(`Buffer upload failed: ${error.message}`, error.stack);
                                return reject(new InternalServerErrorException('Buffer upload failed'));
                            }
                            resolve(result as UploadApiResponse);
                        },
                    );
                    stream.end(file);
                });
            }
        } 
        
        catch (error: any) {
            this.logger.error(`Upload failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Upload failed');
        }
    }

    async delete(
        public_id: string,
        resource_type: 'image' | 'video' | 'raw' | 'auto' = 'auto',
    ): Promise<void> {
        try {
            this.logger.log(`Deleting file → public_id: ${public_id}, type: ${resource_type}`);
            await cloudinary.uploader.destroy(public_id, { resource_type });
        } 
        
        catch (error: any) {
            this.logger.error(`Delete failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Delete from Cloudinary failed');
        }
    }
}
