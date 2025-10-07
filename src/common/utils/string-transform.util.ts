export function transformStringValue(value: string, isLowercase = false, isUppercase = false) {
    const trimmed = value.trim();

    if (isLowercase) return trimmed.toLowerCase();
    if (isUppercase) return trimmed.toUpperCase();

    return trimmed;
}

export function transformStringArray(value: string | string[], isLowercase = false, isUppercase = false) {
    if (Array.isArray(value)) {
        return value.map((v) => transformStringValue(v, isLowercase, isUppercase));
    }

    return [transformStringValue(value, isLowercase, isUppercase)];
}