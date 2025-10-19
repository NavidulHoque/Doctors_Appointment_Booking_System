import {
    registerDecorator,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { transformStringValue } from '../utils';
import { TransformInOrderOptions } from '../interfaces';

@ValidatorConstraint({ name: 'TransformInOrder', async: false })
class TransformInOrderConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const { isLowercase = false, isUppercase = false } = args.constraints[0] as TransformInOrderOptions;

        const obj = args.object;
        obj[args.property] = transformStringValue(value, isLowercase, isUppercase);

        return obj[args.property].length > 0;
    }

    defaultMessage() {
        return 'Invalid string';
    }
}

export function TransformInOrder(
    options?: TransformInOrderOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options,
            constraints: [options],
            validator: TransformInOrderConstraint,
        });
    };
}
