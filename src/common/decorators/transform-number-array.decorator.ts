import { Transform } from 'class-transformer';
import { transformNumberArray } from '../utils';

/**
 * Transforms array of numbers and convert strings to numbers.
 * If a single number is passed, it converts it into an array automatically.
 *
 * Example:
 *   "2" -> [2]
 *   ["2", 3] -> [2, 3]
 * @return A property decorator that transforms the number array.
 */
export function TransformNumberArray() {
    return Transform(({ value }) => {
        if (value === null || value === undefined) return value;
        return transformNumberArray(value);
    });
}
