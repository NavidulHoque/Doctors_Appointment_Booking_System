import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { AuthService } from '@dab/backend/modules/auth/auth.service';
import { AuthController } from '@dab/backend/modules/auth/auth.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
