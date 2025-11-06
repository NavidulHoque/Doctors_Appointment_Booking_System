import { Method, Status } from "@prisma/client";
import { IsOptionalString } from "./is-optional-string.decorator";
import { IsRequiredString } from "./is-required-string.decorator";
import { IsOptionalArrayEnum } from "./is-optional-array-enum.decorator";
import { IsOptionalEnum } from "./is-optional-enum.decorator";

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
            message: 'Name can only contain letters, spaces and dots',
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

export function IsRequiredOTP() {
    return IsRequiredString({
        requiredMessage: 'OTP is required',
        stringMessage: 'OTP must be a string',
        matches: {
            pattern: /^\d{6}$/,
            message: 'OTP must be a 6-digit number'
        }
    });
}

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

export function IsOptionalStatus() {
    return IsOptionalEnum({ 
        enumType: Status, 
        message: `Status must be one of the following values: ${Object.values(Status).join(', ').toLowerCase()}`, 
        isUppercase: true 
    })
}

export function IsOptionalStatuses() {
    return IsOptionalArrayEnum({
        enumType: Status,
        message: `Status must be one of: ${Object.values(Status).join(', ').toLowerCase()}`,
        isUppercase: true,
        minSize: 1,
        minSizeMessage: 'You must select at least 1 status',
        maxSize: 5,
        maxSizeMessage: 'You can select up to 5 statuses'
    })
}

export function IsOptionalPaymentMethod() {
    return IsOptionalEnum({
        enumType: Method,
        message: `Payment must be one of: ${Object.values(Method).join(', ').toLowerCase()}`,
        isUppercase: true
    })
}

export function IsOptionalCancellationReason() {
    return IsOptionalString({ 
        stringMessage: 'Cancellation reason must be a string',
        minLength: 5,
        minLengthMessage: 'Cancellation reason must be at least 5 characters long', 
    })
}