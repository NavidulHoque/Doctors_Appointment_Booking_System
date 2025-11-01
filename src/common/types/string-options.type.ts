type BaseStringOptions = {
    isUUID?: boolean;
    isLowercase?: boolean;
    isUppercase?: boolean;
    minLength?: number;
    maxLength?: number;
    minLengthMessage?: string;
    maxLengthMessage?: string;
    matches?: { pattern: RegExp; message: string };
};

type EmailOptions = BaseStringOptions & {
    isEmail: true;
    stringMessage?: string;
};

type NonEmailOptions = BaseStringOptions & {
    isEmail?: false;
    stringMessage: string;
};

export type RequiredStringOptions = (EmailOptions | NonEmailOptions) & {
    requiredMessage: string;
};

export type OptionalStringOptions = (EmailOptions | NonEmailOptions) & {
    requiredMessage?: string;
};

export type StringOptions = (RequiredStringOptions | OptionalStringOptions) & {
    isOptional?: boolean;
};