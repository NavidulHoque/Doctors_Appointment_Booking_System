import { Global, Module } from '@nestjs/common';
import { OpenAiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Global()
@Module({
  controllers: [OpenAiController],
  providers: [GeminiService],
  exports: [GeminiService]
})
export class OpenAiModule {}
