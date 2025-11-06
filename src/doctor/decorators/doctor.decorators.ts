import { Gender } from "@prisma/client";
import { IsOptionalEnum, IsOptionalNumber, IsOptionalString, IsRequiredNumber, IsRequiredString } from "src/common/decorators";

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

export function IsOptionalExperience() {
    return IsOptionalNumber({
        numberMessage: 'Experience must be a number',
        min: 1,
        minMessage: 'Experience must be at least 1 year',
    })
}

export function IsOptionalFees() {
    return IsOptionalNumber({
        numberMessage: 'Fees must be a number',
        min: 20,
        minMessage: 'Fees must be at least 20',
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

export function IsOptionalGender() {
    return IsOptionalEnum({
        enumType: Gender,
        message: 'Gender must be male, female or other',
        isUppercase: true
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

export function IsRequiredExperience() {
    return IsRequiredNumber({
        requiredMessage: 'Experience is required',
        numberMessage: 'Experience must be a number',
        min: 1,
        minMessage: 'Experience must be at least 1 year',
    })
}

export function IsRequiredFees() {
    return IsRequiredNumber({
        requiredMessage: 'Fees is required',
        numberMessage: 'Fees must be a number',
        min: 20,
        minMessage: 'Fees must be at least 20',
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