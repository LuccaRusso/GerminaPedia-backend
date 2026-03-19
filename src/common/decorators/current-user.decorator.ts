// src/common/decorators/current-user.decorator.ts
// Decorator para extrair o usuário autenticado do request
// Uso: @CurrentUser() user: User

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
