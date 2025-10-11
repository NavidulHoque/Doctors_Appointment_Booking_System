import { BasePayload } from "./base-payload.interface";

export interface AccessTokenPayload extends BasePayload {
    id: string;
}