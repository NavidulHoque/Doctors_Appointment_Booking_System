import { Injectable, InternalServerErrorException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { tools } from './tools';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly client: OpenAI;

  constructor(
    private readonly config: ConfigService
  ) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });
  }

  async processQuery(prompt: string) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [{ role: 'user', content: prompt }],
        tools,
      });

      const message = response.choices[0].message;

      // ✅ Function/tool call from model
      if (message.tool_calls?.length) {
        const call = message.tool_calls[0];

        if (call.type === 'function') {
          return {
            tool: call.function.name,
            arguments: JSON.parse(call.function.arguments),
          };
        }
      }

      // ✅ Fallback to plain text
      return { reply: message.content || 'No tool call detected.' };
    }

    catch (error) {
      this.logger.error('❌ AI query failed, Reason:', error.message);

      if (error.status === 429) {
        throw new HttpException(
          'Quota exceeded or too many requests. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new InternalServerErrorException('You requested query failed to process. Try again later.');
    }
  }
}
