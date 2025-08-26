import { Module } from '@nestjs/common';
import { HandleErrorsService } from './handleErrors.service';
import { CheckRoleService } from './checkRole.service';
import { FetchUserService } from './fetchUser.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ComparePasswordService } from './comparePassword.service';
import { FindEntityByIdService } from './FindEntityById.service';
import { SocketModule } from 'src/socket/socket.module';
import { SocketService } from './socket.service';

@Module({
  imports: [PrismaModule, SocketModule],
  providers: [HandleErrorsService, CheckRoleService, FetchUserService, ComparePasswordService, FindEntityByIdService, SocketService],
  exports: [HandleErrorsService, CheckRoleService, FetchUserService, ComparePasswordService, FindEntityByIdService, SocketService],
})
export class CommonModule { }
