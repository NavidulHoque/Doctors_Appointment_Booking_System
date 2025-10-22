import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils';

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
