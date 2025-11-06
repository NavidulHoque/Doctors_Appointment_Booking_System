import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils';

/**
 * Transforms string(s) by applying lowercase or uppercase rules.
 *
 * @param isLowercase - Convert value(s) to lowercase
 * @param isUppercase - Convert value(s) to uppercase
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
