import { IsRequiredString } from "./is-required-string.decorator";

export function IsRequiredEmail() {
    return IsRequiredString({
        requiredMessage: 'Email is required',
        isEmail: true,
    });
}

export function IsRequiredPassword() {
    return IsRequiredString({
        requiredMessage: 'Password is required',
        stringMessage: 'Password must be a string',
        minLength: 8,
        minLengthMessage: 'Password must be at least 8 characters long',
        matches: {
            pattern: /^(?=.*\d)(?=.*[\W_]).{8,}$/,
            message: 'Password must contain at least one number and one special character',
        },
    });
}

export function IsRequiredName() {
    return IsRequiredString({
        requiredMessage: 'Name is required',
        stringMessage: 'Name must be a valid string',
        minLength: 5,
        minLengthMessage: 'Name must be at least 5 characters long',
        matches: {
            pattern: /^[a-zA-Z. ]+$/,
            message: 'Name can only contain letters, spaces, and dots',
        },
    });
}

export function IsRequiredUUID({
    requiredMessage,
    stringMessage,
}: {
    requiredMessage: string;
    stringMessage: string;
}) {
    return IsRequiredString({
        requiredMessage,
        stringMessage,
        isUUID: true,
    });
}

export function IsRequiredOtp() {
    return IsRequiredString({
        requiredMessage: 'OTP is required',
        stringMessage: 'OTP must be a string',
        matches: {
            pattern: /^\d{6}$/,
            message: 'OTP must be a 6-digit number'
        }
    });
}
