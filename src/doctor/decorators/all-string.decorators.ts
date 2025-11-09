import { IsStringArray } from "src/common/decorators/array";
import { IsOptionalString, IsRequiredString } from "src/common/decorators/string";

export function IsOptionalEducation() {
    return IsOptionalString({
        stringMessage: 'Education must be a string',
        minLength: 5,
        minLengthMessage: 'Education must be at least 5 characters long',
    })
}

export function IsOptionalSpecialization() {
    return IsOptionalString({
        stringMessage: 'Specialization must be a string',
        minLength: 3,
        minLengthMessage: 'Specialization must be at least 3 characters long',
    })
}

export function IsOptionalAboutMe() {
    return IsOptionalString({
        stringMessage: 'About me must be a string',
        minLength: 10,
        minLengthMessage: 'About me must be at least 10 characters long',
    })
}

export function IsOptionalPhone() {
    return IsOptionalString({
        stringMessage: 'phone must be a string',
        matches: {
            pattern: /^\d{11}$/,
            message: 'Phone number must be exactly 11 digits',
        }
    })
}

export function IsRequiredSpecialization() {
    return IsRequiredString({
        requiredMessage: 'Specialization is required',
        stringMessage: 'Specialization must be a string',
        minLength: 3,
        minLengthMessage: 'Specialization must be at least 3 characters long',
    })
}

export function IsRequiredEducation() {
    return IsRequiredString({
        requiredMessage: 'Education is required',
        stringMessage: 'Education must be a string',
        minLength: 5,
        minLengthMessage: 'Education must be at least 5 characters long',
    })
}

export function IsRequiredAboutMe() {
    return IsRequiredString({
        requiredMessage: 'About me is required',
        stringMessage: 'About me must be a string',
        minLength: 10,
        minLengthMessage: 'About me must be at least 10 characters long',
    })
}

export function IsRequiredPhone() {
    return IsRequiredString({
        requiredMessage: 'Phone number is required',
        stringMessage: 'Phone number must be a string',
        matches: {
            pattern: /^\d{11}$/,
            message: 'Phone number must be exactly 11 digits',
        }
    })
}

export function IsRequiredAvailableTimes() {
    return IsStringArray({
        emptyMessage: 'Available times array cannot be empty',
        eachStringMessage: 'Each available time must be a string',
        isLowercase: true
    })
}