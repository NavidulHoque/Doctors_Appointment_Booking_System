import { Transform } from 'class-transformer';
import { transformStringArray } from '../utils';

/**
 * Transforms array of strings by trimming and applying lowercase/uppercase rules.
 * If a single string is passed, it converts it into an array automatically.
 *
 * Example:
 *   "tag" -> ["tag"]
 *   ["TAG", "Example"] -> ["tag", "example"]
 */
export function TransformStringArray(
    isLowercase = false,
    isUppercase = false,
) {
    return Transform(({ value }) => {
        if (value === null || value === undefined) return value;
        return transformStringArray(value, isLowercase, isUppercase);
    });
}
