import { Controller, Post, Body } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';

@Controller('ai')
export class OpenAiController {
  constructor(private readonly openAi: OpenAiService) {}

  @Post('query')
  async query(@Body("prompt") prompt: string) {
    return this.openAi.processQuery(prompt);
  }
}
