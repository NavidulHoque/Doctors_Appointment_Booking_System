import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { AppConfigService } from 'src/config';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private readonly config: AppConfigService) {
        cloudinary.config({
            cloud_name: this.config.cloudinary.cloudName,
            api_key: this.config.cloudinary.apiKey,
            api_secret: this.config.cloudinary.apiSecret,
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
        
        catch (error) {
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
        
        catch (error) {
            this.logger.error(`Delete failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Delete from Cloudinary failed');
        }
    }
}
