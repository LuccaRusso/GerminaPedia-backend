// src/auth/guards/roles.guard.ts
// Guard de controle de acesso baseado em papéis (RBAC)
// Funciona junto com o decorator @Roles()

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Pega os roles exigidos pelo decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não há @Roles(), a rota é livre (já passou pelo JwtAuthGuard)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    // ADMIN tem acesso a tudo
    if (user.role === Role.ADMIN) return true;

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Role necessário: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
