export function transformNumberArray(value: number | string | (number | string)[]) {
    const arr = Array.isArray(value) ? value : [value];
    return arr.map(Number);
}