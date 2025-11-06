import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils';

/**
 * Transforms string by applying lowercase or uppercase rules.
 * @param isLowercase - Convert value to lowercase
 * @param isUppercase - Convert value to uppercase
 * @return A property decorator that transforms the string.
 */
export function TransformString(isLowercase = false, isUppercase = false) {
    return Transform(({ value }) => {
        if (
            value === null ||
            value === undefined ||
            typeof value !== 'string'
        ) {
            return value;
        }

        return transformStringValue(value, isLowercase, isUppercase);
    });
}
