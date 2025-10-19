export interface IsRequiredStringOptions {
    requiredMessage: string;
    stringMessage: string;
    isLowercase?: boolean;
    isUppercase?: boolean;
    isUUID?: boolean;
    minLength?: number;
    maxLength?: number;
    minLengthMessage?: string;
    maxLengthMessage?: string;
    matches?: { pattern: RegExp; message: string };
}