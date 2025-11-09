type BaseArrayOptions = {
  emptyMessage: string;
  isOptional?: boolean;
  minSize?: number;
  minSizeMessage?: string;
  maxSize?: number;
  maxSizeMessage?: string;
}

type transformationOptions = {
  isLowercase?: boolean;
  isUppercase?: boolean;
}

export type NumberArrayOptions = BaseArrayOptions & {
  eachNumberMessage: string;
}

export type StringArrayOptions = BaseArrayOptions & transformationOptions & {
  eachStringMessage: string;
}

export type EnumArrayOptions = BaseArrayOptions & transformationOptions & {
  enumType: object;
  enumMessage: string;
};

export type ArrayOptions = NumberArrayOptions | StringArrayOptions | EnumArrayOptions;