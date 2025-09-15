import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'book_appointment',
              description: 'Book an appointment with a doctor',
              parameters: {
                type: 'object',
                properties: {
                  patientId: { type: 'string' },
                  doctorId: { type: 'string' },
                  datetime: { type: 'string', format: 'date-time' },
                },
                required: ['patientId', 'doctorId', 'datetime'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'cancel_appointment',
              description: 'Cancel an appointment',
              parameters: {
                type: 'object',
                properties: {
                  appointmentId: { type: 'string' },
                },
                required: ['appointmentId'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'get_doctor_schedule',
              description: 'Fetch doctor schedule',
              parameters: {
                type: 'object',
                properties: {
                  doctorId: { type: 'string' },
                },
                required: ['doctorId'],
              },
            },
          },
        ],
      });

      const message = response.choices[0].message;

      // ✅ Function/tool call from model
      if (message.tool_calls?.length) {
        const call = message.tool_calls[0];
        return {
          tool: call.function.name,
          arguments: JSON.parse(call.function.arguments),
        };
      }

      // ✅ Fallback to plain text
      return { reply: message.content || 'No tool call detected.' };
    } catch (error) {
      this.logger.error('AI query failed', error);
      throw new Error('AI query failed: ' + error.message);
    }
  }
}
