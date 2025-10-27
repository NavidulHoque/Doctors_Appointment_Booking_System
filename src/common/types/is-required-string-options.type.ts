import { EmailOptions } from "./email-options.type";
import { NonEmailOptions } from "./non-email-options.type";

export type IsRequiredStringOptions = (EmailOptions | NonEmailOptions) & {
    requiredMessage: string;
    isUUID?: boolean;
};