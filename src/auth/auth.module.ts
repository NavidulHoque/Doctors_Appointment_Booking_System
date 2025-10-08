import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthHelperService } from './auth-helper.service';

@Global()
@Module({
  providers: [AuthService, AuthHelperService],
  controllers: [AuthController],
  exports: [AuthHelperService]
})
export class AuthModule { }
