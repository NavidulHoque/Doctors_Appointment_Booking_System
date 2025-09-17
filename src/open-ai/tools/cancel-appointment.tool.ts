import { ChatCompletionTool } from 'openai/resources/chat/completions';

export const cancelAppointmentTool: ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'cancel_appointment',
        description: 'Cancel an appointment',
        parameters: {
            type: 'object',
            properties: {
                appointmentId: { type: 'string' },
            },
            required: ['appointmentId'],
        },
    },
}