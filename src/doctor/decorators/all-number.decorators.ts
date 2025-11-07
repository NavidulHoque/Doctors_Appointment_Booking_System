import { IsOptionalNumber, IsRequiredNumber } from "src/common/decorators/number";

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