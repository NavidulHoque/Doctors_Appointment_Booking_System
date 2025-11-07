import { applyDecorators } from '@nestjs/common';
import { TransformNumberArray } from './transform-number-array.decorator';
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsNumber, IsOptional } from 'class-validator';

/**
 * Validates that a property is an optional enum value.
 * Automatically transforms the string to lowercase or uppercase if specified.
 * @param eachNumberMessage - Custom validation message for each non-number element.
 * @param emptyMessage - Custom validation message if the array is empty.
 * @param arrayMessage - Custom validation message if the value is not an array.
 * @param isOptional - Whether the property is optional (default: false).
 * @param minSize - Minimum size of the array.
 * @param minSizeMessage - Custom validation message for minimum size.
 * @param maxSize - Maximum size of the array.
 * @param maxSizeMessage - Custom validation message for maximum size.
 * @returns A property decorator that applies the specified validations.
 */
export function IsNumberArray({
    eachNumberMessage,
    emptyMessage,
    arrayMessage,
    isOptional = false,
    minSize,
    minSizeMessage,
    maxSize,
    maxSizeMessage,
}) {
    const decorators: PropertyDecorator[] = [
        TransformNumberArray(),
        isOptional ? IsOptional() : ArrayNotEmpty({ message: emptyMessage }),
        IsArray({ message: arrayMessage }),
        IsNumber({}, { each: true, message: eachNumberMessage })
    ]

    if (minSize !== undefined) {
        decorators.push(ArrayMinSize(minSize, { message: minSizeMessage }));
    }

    if (maxSize !== undefined) {
        decorators.push(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return applyDecorators(...decorators);
}
