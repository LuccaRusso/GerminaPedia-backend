// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() torna o PrismaService disponível em todos os módulos
// sem precisar importar o PrismaModule explicitamente em cada um
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
