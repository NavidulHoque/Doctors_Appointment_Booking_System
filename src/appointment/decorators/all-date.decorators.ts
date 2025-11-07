import { IsDateField } from "src/common/decorators";

export function IsRequiredFutureDate() {
    return IsDateField({
        dateMessage: "Date must be a valid date",
        comparisonType: "future",
        comparisonMessage: "Date must be in the future",
    })
}