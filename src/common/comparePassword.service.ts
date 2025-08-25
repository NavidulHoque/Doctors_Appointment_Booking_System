import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

@Injectable()
export class ComparePasswordService {

    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        const isMatched = await argon.verify(hashedPassword, plainPassword)

        return isMatched
    }
}
