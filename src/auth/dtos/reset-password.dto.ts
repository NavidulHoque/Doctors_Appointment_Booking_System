import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredString } from "src/common/decorators";

export class ResetPasswordDto extends BaseAuthDto {

    @IsRequiredString({
        requiredMessage: 'New password is required',
        stringMessage: 'New password must be a string',
        minLength: 8,
        minLengthMessage: 'New password must be at least 8 characters long',
    })
    readonly newPassword: string;
}