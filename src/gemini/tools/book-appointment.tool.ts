import { Tool, SchemaType } from '@google/generative-ai';

export const bookAppointmentTool: Tool = {
  functionDeclarations: [
    {
      name: 'bookAppointment',
      description: 'Book an appointment with a doctor',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          patientId: { type: SchemaType.STRING },
          doctorId: { type: SchemaType.STRING },
          date: { type: SchemaType.STRING, description: 'ISO date string' },
        },
        required: ['patientId', 'doctorId', 'date'],
      },
    },
  ],
};
