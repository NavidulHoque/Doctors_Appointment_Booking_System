import { IsRequiredNumber } from "src/common/decorators/number";

export function IsRequiredRating() {
    return IsRequiredNumber({
        requiredMessage: 'Rating is required',
        numberMessage: 'Rating must be a number',
        min: 1,
        minMessage: 'Rating must be at least 1',
        max: 5,
        maxMessage: 'Rating must be at most 5',
    })
}