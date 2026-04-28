import { SetMetadata } from '@nestjs/common';
import type { RoleType } from '@dab/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
