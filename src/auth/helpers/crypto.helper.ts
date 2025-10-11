import { Injectable } from "@nestjs/common";
import * as argon from 'argon2';

@Injectable()
export class CryptoHelper {
    async hashValue(value: string) {
        return await argon.hash(value);
    }

    async verifyHash(hashed: string, plainValue: string) {
        return await argon.verify(hashed, plainValue);
    }
}
