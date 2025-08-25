import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';

@Module({
    imports: [ConfigModule, PrismaModule, CommonModule],
    providers: [UserService],
    controllers: [UserController]
})
export class UserModule { }
