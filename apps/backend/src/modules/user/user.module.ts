import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { UserService } from '@backend/modules/user/user.service';
import { UserController } from '@backend/modules/user/user.controller';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
})
export class UserModule {}
