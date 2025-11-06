import { IsOptionalString } from "./is-optional-string.decorator";

export function IsOptionalEmail() {
    return IsOptionalString({
        isEmail: true,
    });
}

export function IsOptionalName() {
    return IsOptionalString({
        stringMessage: 'Name must be a string',
        minLength: 5,
        minLengthMessage: 'Name must be at least 5 characters long',
        matches: {
            pattern: /^[a-zA-Z. ]+$/,
            message: 'Full name can only contain letters, spaces and dots',
        }
    })
}

export function IsOptionaSearch() {
    return IsOptionalString({
        stringMessage: 'Search query must be a string',
        minLength: 3,
        minLengthMessage: 'Search query must be at least 3 characters long',
    })
}

export function IsOptionalCancellationReason() {
    return IsOptionalString({ 
        stringMessage: 'Cancellation reason must be a string',
        minLength: 5,
        minLengthMessage: 'Cancellation reason must be at least 5 characters long', 
    })
}