import { Method, Status } from "@prisma/client"
import { IsEnumArray } from "src/common/decorators/array"
import { IsOptionalEnum } from "src/common/decorators/enum"

export function IsOptionalStatus() {
    return IsOptionalEnum({ 
        enumType: Status, 
        enumMessage: `Status must be one of the following values: ${Object.values(Status).join(', ').toLowerCase()}`, 
        isUppercase: true 
    })
}

export function IsOptionalStatuses() {
    return IsEnumArray({
        emptyMessage: 'Status array cannot be empty',
        enumType: Status,
        enumMessage: `Status must be one of: ${Object.values(Status).join(', ').toLowerCase()}`,
        isOptional: true,
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
        enumMessage: `Payment must be one of: ${Object.values(Method).join(', ').toLowerCase()}`,
        isUppercase: true
    })
}