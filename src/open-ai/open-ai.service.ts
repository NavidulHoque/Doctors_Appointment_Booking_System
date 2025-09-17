import { Injectable, Logger } from '@nestjs/common';
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

  async processQuery(userPrompt: string) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [{ role: 'user', content: userPrompt }],
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
      this.logger.error('AI query failed', error);
      throw new Error('AI query failed: ' + error.message);
    }
  }
}
