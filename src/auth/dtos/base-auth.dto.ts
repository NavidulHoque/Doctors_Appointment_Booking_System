import { IsRequiredEmail } from "src/common/decorators/string";

export class BaseAuthDto {

    @IsRequiredEmail()
    readonly email: string;
}
