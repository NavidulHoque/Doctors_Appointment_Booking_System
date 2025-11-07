import { Gender } from "@prisma/client";
import { IsOptionalEnum } from "src/common/decorators/enum";

export function IsOptionalGender() {
    return IsOptionalEnum({
        enumType: Gender,
        message: 'Gender must be male, female or other',
        isUppercase: true
    })
}