export function transformStringValue(value: string, isLowercase = false, isUppercase = false) {
    const trimmed = value.trim();

    if (isLowercase) return trimmed.toLowerCase();
    if (isUppercase) return trimmed.toUpperCase();

    return trimmed.length ? trimmed : undefined;
}

export function transformStringArray(value: string | string[], isLowercase = false, isUppercase = false) {

    const arr = Array.isArray(value) ? value : [value];

    return arr.map((v) => transformStringValue(v, isLowercase, isUppercase));
}