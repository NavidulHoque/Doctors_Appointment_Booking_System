import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraintInterface,
    ValidatorConstraint
} from 'class-validator';
import { ComparisonType } from '../types';

@ValidatorConstraint({ name: 'DateComparison', async: false })
class DateComparisonConstraint implements ValidatorConstraintInterface {
    validate(value: Date, args: ValidationArguments) {
        if (!(value instanceof Date) || isNaN(value.getTime())) return false;

        const valInMs = value.getTime();
        const now = Date.now();

        const compareMap: Record<ComparisonType, boolean> = {
            future: valInMs > now,
            futureOrEqual: valInMs >= now,
            past: valInMs < now,
            pastOrEqual: valInMs <= now,
        };

        return compareMap[args.constraints[0]];
    }

    defaultMessage(args: ValidationArguments) {
        const type = args.constraints[0] as ComparisonType;
        const messageMap: Record<ComparisonType, string> = {
            future: `${args.property} must be in the future`,
            futureOrEqual: `${args.property} must be in the future or now`,
            past: `${args.property} must be in the past`,
            pastOrEqual: `${args.property} must be in the past or now`,
        };

        return messageMap[type];
    }
}

export function DateComparison(
    type: ComparisonType,
    options?: ValidationOptions
) {
    return function (target: object, propertyName: string) {
        registerDecorator({
            name: 'DateComparison',
            target: target.constructor,
            propertyName,
            constraints: [type],
            options,
            validator: DateComparisonConstraint,
        });
    };
}
