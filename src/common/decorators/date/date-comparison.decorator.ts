import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraintInterface,
    ValidatorConstraint
} from 'class-validator';
import { ComparisonType } from 'src/common/types';

/**
 * Custom validator to compare date fields.
 * Supports: 'future', 'futureOrEqual', 'past', 'pastOrEqual', 'afterField', 'beforeField'
 */
@ValidatorConstraint({ name: 'DateComparison', async: false })
class DateComparisonConstraint implements ValidatorConstraintInterface {

    private static compareMap = {
        future: (valInMs: number, now: number) => valInMs > now,
        futureOrEqual: (valInMs: number, now: number) => valInMs >= now,
        past: (valInMs: number, now: number) => valInMs < now,
        pastOrEqual: (valInMs: number, now: number) => valInMs <= now,
    };

    validate(value: Date, args: ValidationArguments) {
        if (!(value instanceof Date) || isNaN(value.getTime())) return false;
        const valInMs = value.getTime();

        const [type, relatedField] = args.constraints as [ComparisonType, string | undefined];

        if (type === 'afterField' || type === 'beforeField') {
            if (!relatedField || !(relatedField in args.object)) return false;

            const relatedValue = args.object[relatedField] as Date;
            if (!(relatedValue instanceof Date) || isNaN(relatedValue.getTime())) return false;

            const relatedMs = relatedValue.getTime();
            return type === 'afterField' ? valInMs > relatedMs : valInMs < relatedMs;
        }

        const fn = DateComparisonConstraint.compareMap[type];
        return fn ? fn(valInMs, Date.now()) : false;
    }

    defaultMessage(args: ValidationArguments) {
        const [type, relatedField] = args.constraints as [ComparisonType, string | undefined];
        switch (type) {
            case 'future': return `${args.property} must be in the future`;
            case 'futureOrEqual': return `${args.property} must be in the future or now`;
            case 'past': return `${args.property} must be in the past`;
            case 'pastOrEqual': return `${args.property} must be in the past or now`;
            case 'afterField': return `${args.property} must be after ${relatedField}`;
            case 'beforeField': return `${args.property} must be before ${relatedField}`;
            default: return `${args.property} has invalid comparison type`;
        }
    }
}

export function DateComparison(
    type: ComparisonType,
    relatedField?: string | undefined,
    options?: ValidationOptions
) {
    return function (target: object, propertyName: string) {
        registerDecorator({
            name: 'DateComparison',
            target: target.constructor,
            propertyName,
            constraints: [type, relatedField],
            options,
            validator: DateComparisonConstraint,
        });
    };
}
