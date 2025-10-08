class BaseUserDto {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;

    constructor(user: Record<string, any>) {
        this.id = user.id;
        this.fullName = user.fullName;
        this.email = user.email;
    }
}

class SessionUserInfoDto extends BaseUserDto {
    readonly role: string;

    constructor(user: Record<string, any>) {
        super(user);
        this.role = user.role;
    }
}

export class SessionResponseDto {
    readonly id: string;
    readonly deviceName: string | null;
    readonly user: SessionUserInfoDto;

    constructor(session: Record<string, any>) {
        this.id = session.id;
        this.deviceName = session.deviceName || null;
        this.user = new SessionUserInfoDto(session.user);
    }
}
