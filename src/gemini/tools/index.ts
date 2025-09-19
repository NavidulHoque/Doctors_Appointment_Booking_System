import { Tool } from '@google/generative-ai';
import { bookAppointmentTool } from './book-appointment.tool';
import { cancelAppointmentTool } from './cancel-appointment.tool';
import { getDoctorScheduleTool } from './get-doctor-schedule.tool';

export const tools: Tool[] = [
  bookAppointmentTool,
  cancelAppointmentTool,
  getDoctorScheduleTool,
];
