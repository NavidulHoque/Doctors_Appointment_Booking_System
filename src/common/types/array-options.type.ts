type BaseArrayOptions = {
  arrayMessage?: string;
  emptyMessage?: string;
  isOptional?: boolean;
  minSize?: number;
  minSizeMessage?: string;
  maxSize?: number;
  maxSizeMessage?: string;
}

export type NumberArrayOptions = BaseArrayOptions & {
  eachNumberMessage?: string;
}

export type StringArrayOptions = BaseArrayOptions & {
  eachStringMessage?: string;
  isLowercase?: boolean;
  isUppercase?: boolean;
}

export type EnumArrayOptions = BaseArrayOptions & {
  enumType: object;
  message?: string;
  isLowercase?: boolean;
  isUppercase?: boolean;
};

export type ArrayOptions = NumberArrayOptions | StringArrayOptions;