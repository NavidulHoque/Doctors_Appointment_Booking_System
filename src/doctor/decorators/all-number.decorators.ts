import { IsNumberArray } from "src/common/decorators/array";
import { IsOptionalNumber, IsRequiredNumber } from "src/common/decorators/number";

export function IsOptionalExperience() {
    return IsOptionalNumber({
        numberMessage: 'Experience must be a number',
        min: 1,
        minMessage: 'Experience must be at least 1 year',
    })
}

export function IsOptionalFee() {
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

export function IsOptionalExperiences() {
    return IsNumberArray({
        emptyMessage: 'Experience array should not be empty',
        eachNumberMessage: 'Each experience must be a number',
        isOptional: true,
        maxSize: 2,
        maxSizeMessage: 'Experience array can contain at most 2 elements'
    })
}

export function IsOptionalFees() {
    return IsNumberArray({
        emptyMessage: 'Fees array should not be empty',
        eachNumberMessage: 'Each fee must be a number',
        isOptional: true,
        maxSize: 2,
        maxSizeMessage: 'Fees array can contain at most 2 elements'
    })
}