import { Tool, SchemaType } from '@google/generative-ai';

export const getDoctorScheduleTool: Tool = {
    functionDeclarations: [
        {
            name: 'getDoctorSchedule',
            description: 'Retrieve available slots for a doctor',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    doctorId: { type: SchemaType.STRING },
                },
                required: ['doctorId'],
            },
        },
    ],
};
