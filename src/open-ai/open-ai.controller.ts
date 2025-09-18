import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators';

@Controller('open-ai')
@UseGuards(AuthGuard, RolesGuard)
export class OpenAiController {
  constructor(private readonly openAi: OpenAiService) {}

  @Post('query')
  @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
  async query(@Body("prompt") prompt: string) {
    return this.openAi.processQuery(prompt);
  }
}
