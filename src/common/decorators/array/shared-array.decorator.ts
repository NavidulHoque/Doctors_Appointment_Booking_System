import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { TransformNumberArray } from "./transform-number-array.decorator";
import { TransformStringArray } from "./transform-string-array.decorator";
import { ArrayOptions, NumberArrayOptions, StringArrayOptions } from "src/common/types";

/**
 * Internal factory to build array validators for both number and string arrays.
 * Keeps logic consistent and DRY across both variants.
 */
export function createArrayDecorators(
    type: 'number' | 'string',
    options: ArrayOptions,
) {
    const {
        arrayMessage = 'Value must be an array',
        emptyMessage = 'Array cannot be empty',
        isOptional = false,
        minSize,
        minSizeMessage,
        maxSize,
        maxSizeMessage,
    } = options;

    const decorators: PropertyDecorator[] = [];

    if (type === 'number') {
        decorators.push(TransformNumberArray());
    } else {
        const { isLowercase = false, isUppercase = false } = options as StringArrayOptions;
        decorators.push(TransformStringArray(isLowercase, isUppercase));
    }

    if (isOptional) {
        decorators.push(IsOptional());
    }

    decorators.push(
        ArrayNotEmpty({ message: emptyMessage }),
        IsArray({ message: arrayMessage })
    );

    if (type === 'number') {
        const { eachNumberMessage } = options as NumberArrayOptions;
        decorators.push(IsNumber({}, { each: true, message: eachNumberMessage }));
    } else {
        const { eachStringMessage } = options as StringArrayOptions;
        decorators.push(IsString({ each: true, message: eachStringMessage }));
    }

    if (minSize !== undefined) {
        decorators.push(ArrayMinSize(minSize, { message: minSizeMessage }));
    }
    if (maxSize !== undefined) {
        decorators.push(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return decorators;
}