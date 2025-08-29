import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FindEntityByIdService } from './FindEntityById.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [PrismaModule, SocketModule],
  providers: [FindEntityByIdService],
  exports: [FindEntityByIdService],
})
export class CommonModule { }
