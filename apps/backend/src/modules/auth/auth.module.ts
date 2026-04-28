import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Session } from '@dab/database';
import { AuthService } from '@backend/modules/auth/auth.service';
import { AuthController } from '@backend/modules/auth/auth.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User, Session])],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
