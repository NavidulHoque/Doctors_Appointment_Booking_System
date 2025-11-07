import { Method, Status } from "@prisma/client"
import { IsOptionalArrayEnum, IsOptionalEnum } from "src/common/decorators"

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