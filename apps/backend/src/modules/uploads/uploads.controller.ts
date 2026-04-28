import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { RequestAvatarUploadSchema, ConfirmAvatarUploadSchema } from '@dab/validation';
import { UploadsService } from '@backend/modules/uploads/uploads.service';
import { CurrentUser } from '@backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';

class RequestAvatarUploadDto extends createZodDto(RequestAvatarUploadSchema) {}
class ConfirmAvatarUploadDto extends createZodDto(ConfirmAvatarUploadSchema) {}

@ApiTags('uploads')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('uploads')
export class UploadsController {
	constructor(private readonly uploadsService: UploadsService) {}

	@Post('avatar/request')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Get a signed URL to upload avatar to Supabase Storage' })
	@ApiOkResponse({ description: 'Signed upload URL and file path returned' })
	@ApiBadRequestResponse({ description: 'Unsupported file extension' })
	requestUpload(@Body() dto: RequestAvatarUploadDto, @CurrentUser() user: User) {
		return this.uploadsService.requestAvatarUploadUrl(user.id, dto.fileName, dto.mimeType);
	}

	@Post('avatar/confirm')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Confirm avatar upload and update profile image URL' })
	@ApiOkResponse({ description: 'Avatar image URL updated on user profile' })
	confirmUpload(@Body() dto: ConfirmAvatarUploadDto, @CurrentUser() user: User) {
		return this.uploadsService.confirmAvatarUpload(user.id, dto.filePath);
	}
}
