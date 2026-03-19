// src/auth/guards/jwt-auth.guard.ts
// Guard que protege rotas — aplica autenticação JWT
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
