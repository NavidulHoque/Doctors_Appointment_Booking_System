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
import { CheckRoleService } from 'src/common/checkRole.service';
import { User } from 'src/user/decorator';
import { UserDto } from 'src/user/dto';
import { AuthGuard } from 'src/auth/guard';

@UseGuards(AuthGuard)
@Controller('upload')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly checkRoleService: CheckRoleService
  ) { }

  @Post("avatarImage")
  @UseInterceptors(FileInterceptor('image', multerOptions))
  uploadAvatarImage(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserDto
  ) {
    this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
    return this.uploadsService.uploadAvatarImage(file, user.id);
  }
}
