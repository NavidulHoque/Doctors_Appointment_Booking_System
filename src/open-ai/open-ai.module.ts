import { Global, Module } from '@nestjs/common';
import { OpenAiController } from './open-ai.controller';
import { OpenAiService } from './open-ai.service';

@Global()
@Module({
  controllers: [OpenAiController],
  providers: [OpenAiService],
  exports: [OpenAiService]
})
export class OpenAiModule {}
