import {
  Injectable,
  InternalServerErrorException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { McpService } from 'src/mcp';
import { tools } from './tools';
import { CreateAppointmentDto, UpdateAppointmentDto } from 'src/appointment/dtos';
import { GetScheduleDto } from 'src/mcp/dtos';
import { AppConfigService } from 'src/config';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI;

  constructor(
    private readonly config: AppConfigService,
    private readonly mcpService: McpService,
  ) {
    this.client = new GoogleGenerativeAI(
      this.config.gemini.apiKey,
    );
  }

  async processQuery(prompt: string, traceId: string) {
    try {
      const modelName = this.config.gemini.model || 'gemini-2.5-pro';

      const model = this.client.getGenerativeModel({
        model: modelName,
        tools,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      const text = response.text();

      // Handle tool calls
      const parts = response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.functionCall) {
          const { name, args } = part.functionCall;
          this.logger.log(`Gemini requested tool: ${name}`);

          switch (name) {
            case 'bookAppointment': {
              const dto = args as CreateAppointmentDto;
              return this.mcpService.bookAppointment(dto, traceId!);
            }
            case 'cancelAppointment': {
              const dto = args as UpdateAppointmentDto;
              // return this.mcpService.cancelAppointment(dto, traceId!);
            }
            case 'getDoctorSchedule': {
              const dto = args as GetScheduleDto;
              return this.mcpService.getDoctorSchedule(dto, traceId!);
            }

            default:
              return { reply: text || 'No response generated.' };
          }
        }
      }

      return { reply: text || 'No response generated.' };
    } 
    
    catch (error) {
      this.logger.error('❌ Gemini query failed, Reason:', error.message);

      if (error.status === 429) {
        throw new HttpException(
          'Quota exceeded or too many requests. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new InternalServerErrorException(
        'Your query failed to process. Try again later.',
      );
    }
  }
}
