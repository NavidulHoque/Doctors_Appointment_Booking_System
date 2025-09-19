import { Tool, SchemaType } from '@google/generative-ai';

export const cancelAppointmentTool: Tool = {
    functionDeclarations: [
        {
            name: 'cancelAppointment',
            description: 'Cancel an existing appointment',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    appointmentId: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING },
                },
                required: ['appointmentId'],
            },
        },
    ],
};
