import { IsOptionalString } from "src/common/decorators";

export function IsOptionalCancellationReason() {
    return IsOptionalString({ 
        stringMessage: 'Cancellation reason must be a string',
        minLength: 5,
        minLengthMessage: 'Cancellation reason must be at least 5 characters long', 
    })
}