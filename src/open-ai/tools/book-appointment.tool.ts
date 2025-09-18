import { ChatCompletionTool } from 'openai/resources/chat/completions';

export const bookAppointmentTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'book_appointment',
    description: 'Book an appointment with a doctor',
    parameters: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
        doctorId: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
      },
      required: ['patientId', 'doctorId', 'date'],
    },
  },
};
