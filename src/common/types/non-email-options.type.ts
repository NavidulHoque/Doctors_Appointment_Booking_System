import { BaseStringOptions } from "./base-string-options.type";

export type NonEmailOptions = BaseStringOptions & {
  isEmail?: false;
  stringMessage: string;
};