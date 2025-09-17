import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { bookAppointmentTool } from './book-appointment.tool';
import { cancelAppointmentTool } from './cancel-appointment.tool';
import { getDoctorScheduleTool } from './get-doctor-schedule.tool';

export const tools: ChatCompletionTool[] = [
  bookAppointmentTool,
  cancelAppointmentTool,
  getDoctorScheduleTool,
];
