import { Gender } from "@prisma/client";
import { IsEnumArray } from "src/common/decorators/array";
import { IsOptionalEnum } from "src/common/decorators/enum";
import { WeekDays } from "../enums";

export function IsOptionalGender() {
    return IsOptionalEnum({
        enumType: Gender,
        enumMessage: 'Gender must be male, female or other',
        isUppercase: true
    })
}

export function IsOptionalWeekDays() {
    return IsEnumArray({
        emptyMessage: 'Week days array cannot be empty',
        enumType: WeekDays,
        enumMessage: 'Each day must be a valid week day',
        isLowercase: true,
        isOptional: true,
        maxSize: 7,
        maxSizeMessage: 'Week days array can have maximum 7 days'
    })
}