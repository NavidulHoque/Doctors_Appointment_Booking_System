import { Body, Controller, Post, Req } from '@nestjs/common';
import { McpService } from './mcp.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from 'src/appointment/dto';
import { RequestWithTrace } from 'src/common/types';
import { GetScheduleDto } from './dto';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post('book-appointment')
  async book(
    @Body() dto: CreateAppointmentDto,
    @Req() req: RequestWithTrace
  ) {
    const traceId = req.traceId
    return this.mcpService.bookAppointment(dto, traceId);
  }

  @Post('cancel-appointment')
  async cancel(
    @Body() dto: UpdateAppointmentDto,
    @Req() req: RequestWithTrace
  ) {
    const traceId = req.traceId
    return this.mcpService.cancelAppointment(dto, traceId);
  }

  @Post('get-schedule')
  async schedule(
    @Body() dto: GetScheduleDto,
    @Req() req: RequestWithTrace
  ) {
    const traceId = req.traceId
    return this.mcpService.getDoctorSchedule(dto, traceId);
  }
}
