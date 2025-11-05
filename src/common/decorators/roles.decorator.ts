import { SetMetadata } from '@nestjs/common';
import { AllRoles } from 'src/shared/helpers/user-admin-roles';

export const Roles = (...roles: AllRoles[]) => SetMetadata('roles', roles);