import { Module } from '@nestjs/common';
import { HandleErrorsService } from './handleErrors.service';
import { CheckRoleService } from './checkRole.service';
import { FetchUserService } from './fetchUser.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ComparePasswordService } from './comparePassword.service';
import { FindEntityByIdService } from './FindEntityById.service';

@Module({
  imports: [PrismaModule],
  providers: [HandleErrorsService, CheckRoleService, FetchUserService, ComparePasswordService, FindEntityByIdService],
  exports: [HandleErrorsService, CheckRoleService, FetchUserService, ComparePasswordService, FindEntityByIdService],
})
export class CommonModule { }
