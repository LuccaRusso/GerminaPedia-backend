// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
// Exemplo de uso: @Roles(Role.ADMIN, Role.EDITOR)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
