import {
    registerDecorator,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { transformStringValue } from '../utils';
import { TransformAfterValidationOptions } from '../interfaces';

@ValidatorConstraint({ name: 'TransformAfterValidation', async: false })
class TransformAfterValidationConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        const { isLowercase, isUppercase } = args.constraints[0] as TransformAfterValidationOptions;

        const obj = args.object;
        obj[args.property] = transformStringValue(value, isLowercase, isUppercase);

        return obj[args.property].length > 0;
    }

    defaultMessage() {
        return 'Invalid string';
    }
}

export function TransformAfterValidation(
    options?: TransformAfterValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options,
            constraints: [options],
            validator: TransformAfterValidationConstraint,
        });
    };
}
