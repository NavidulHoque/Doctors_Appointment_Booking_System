import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TransformNumberArray } from "./transform-number-array.decorator";
import { TransformStringArray } from "./transform-string-array.decorator";
import { ArrayOptions, EnumArrayOptions, NumberArrayOptions, StringArrayOptions } from "src/common/types";

/**
 * ================================
 * Factory: createArrayDecorators
 * ================================
 * Handles number, string, and enum arrays with transformations and validations.
 */
export function createArrayDecorators(
    type: 'number' | 'string' | 'enum',
    options: ArrayOptions,
) {
    const {
        emptyMessage,
        isOptional = false,
        minSize,
        minSizeMessage,
        maxSize,
        maxSizeMessage,
    } = options;

    const decorators: PropertyDecorator[] = [];

    /**
     * 1️⃣ Transform
     */
    if (type === 'number') {
        decorators.push(TransformNumberArray());
    } else {
        const { isLowercase = false, isUppercase = false } = options as StringArrayOptions | EnumArrayOptions;
        decorators.push(TransformStringArray(isLowercase, isUppercase));
    }

    /**
     * 2️⃣ Optional
     */
    if (isOptional) {
        decorators.push(IsOptional());
    }

    /**
     * 3️⃣ Array not empty Validation
     */
    decorators.push(ArrayNotEmpty({ message: emptyMessage }));

    switch (type) {
        case 'number': {
            const { eachNumberMessage } = options as NumberArrayOptions;
            decorators.push(IsNumber({}, { each: true, message: eachNumberMessage }));
            break;
        }

        case 'string': {
            const { eachStringMessage } = options as StringArrayOptions;
            decorators.push(IsString({ each: true, message: eachStringMessage }));
            break;
        }

        case 'enum': {
            const { enumType, enumMessage } = options as EnumArrayOptions;
            decorators.push(IsEnum(enumType, { each: true, message: enumMessage }));
            break;
        }
    }

    /**
     * 4️⃣ Min / Max size validation
     */
    if (minSize !== undefined) {
        decorators.push(ArrayMinSize(minSize, { message: minSizeMessage }));
    }
    if (maxSize !== undefined) {
        decorators.push(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return decorators;
}