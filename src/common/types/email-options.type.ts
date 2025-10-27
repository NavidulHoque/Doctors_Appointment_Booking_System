import { BaseStringOptions } from "./base-string-options.type";

export type EmailOptions = BaseStringOptions & {
  isEmail: true;
  stringMessage?: string;
};