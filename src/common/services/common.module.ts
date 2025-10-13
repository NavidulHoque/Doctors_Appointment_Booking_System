import { Global, Module } from '@nestjs/common';
import { HandleErrorsService } from './handle-errors.service';

@Global()
@Module({
  providers: [HandleErrorsService],
  exports: [HandleErrorsService],
})
export class CommonModule { }
