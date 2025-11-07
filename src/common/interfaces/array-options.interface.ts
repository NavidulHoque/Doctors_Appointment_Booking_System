interface BaseArrayOptions {
  arrayMessage?: string;
  emptyMessage?: string;
  isOptional?: boolean;
  minSize?: number;
  minSizeMessage?: string;
  maxSize?: number;
  maxSizeMessage?: string;
}

export interface NumberArrayOptions extends BaseArrayOptions {
  eachNumberMessage?: string;
}

export interface StringArrayOptions extends BaseArrayOptions {
  eachStringMessage?: string;
  isLowercase?: boolean;
  isUppercase?: boolean;
}