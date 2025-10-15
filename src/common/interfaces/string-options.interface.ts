export interface StringOptions {
    stringMessage: string;
    isLowercase?: boolean;
    isUppercase?: boolean;
    minLength?: number;
    maxLength?: number;
    minLengthMessage?: string;
    maxLengthMessage?: string;
    matches?: { pattern: RegExp; message: string };
}