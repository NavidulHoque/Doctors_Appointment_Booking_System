import { ComparisonType } from "../types";

export interface DateOptions {
    dateMessage: string;
    isOptional?: boolean;
    comparisonType?: ComparisonType;
    relatedField?: string;
    comparisonMessage?: string;
}
