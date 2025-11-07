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

export function IsOptionalPassword() {
    return IsOptionalString({
        stringMessage: 'Password must be a string',
        minLength: 8,
        minLengthMessage: 'Password must be at least 8 characters long',
        matches: {
            pattern: /^(?=.*\d)(?=.*[\W_]).{8,}$/,
            message: 'Password must contain at least one number and one special character',
        }
    })
}

export function IsOptionalSearch() {
    return IsOptionalString({
        stringMessage: 'Search query must be a string',
        isLowercase: true
    })
}