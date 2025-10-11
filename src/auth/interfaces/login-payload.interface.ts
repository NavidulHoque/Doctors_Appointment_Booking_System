import { BasePayload } from "./base-payload.interface";

export interface LoginPayload extends BasePayload {
    password: string;
    deviceName?: string;
}