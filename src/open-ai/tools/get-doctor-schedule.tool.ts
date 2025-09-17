import { ChatCompletionTool } from 'openai/resources/chat/completions';

export const getDoctorScheduleTool: ChatCompletionTool = {
    type: 'function',
    function: {
        name: 'get_doctor_schedule',
        description: 'Fetch doctor schedule',
        parameters: {
            type: 'object',
            properties: {
                doctorId: { type: 'string' },
            },
            required: ['doctorId'],
        },
    },
}