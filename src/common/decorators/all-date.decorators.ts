import { IsDateField } from "./is-date-field.decorator";

export function IsOptionalBirthDate() {
    return IsDateField({
        dateMessage: 'Birth date must be a valid date',
        isOptional: true
    })
}