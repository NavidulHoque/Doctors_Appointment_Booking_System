import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { AuthGuard, CsrfGuard, RolesGuard } from 'src/auth/guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators';
import { RequestWithTrace } from 'src/common/types';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('open-ai')
@UseGuards(CsrfGuard, AuthGuard, RolesGuard)
@SkipThrottle()
export class OpenAiController {
  constructor(private readonly gemini: GeminiService) {}

  @Post('query')
  @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
  async query(
    @Body("prompt") prompt: string,
    @Req() req: RequestWithTrace
  ) {
    const traceId = req.traceId
    return this.gemini.processQuery(prompt, traceId);
  }
}
