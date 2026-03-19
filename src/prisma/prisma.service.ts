// src/prisma/prisma.service.ts
// Wrapper do PrismaClient para injeção de dependência no NestJS
// Centraliza conexão e desconexão do banco

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
        // Em dev, logar queries para debugar; em prod, comentar a linha abaixo
        // { emit: 'stdout', level: 'query' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Conectado ao PostgreSQL via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Desconectado do PostgreSQL');
  }

  // Utilitário para limpar o banco em testes
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase não pode ser executado em produção!');
    }
    // Ordem importa por causa das FK constraints
    await this.comment.deleteMany();
    await this.wikiVersion.deleteMany();
    await this.wiki.deleteMany();
    await this.historiaEvento.deleteMany();
    await this.historiaAluno.deleteMany();
    await this.historia.deleteMany();
    await this.eventoAluno.deleteMany();
    await this.eventoSala.deleteMany();
    await this.evento.deleteMany();
    await this.aluno.deleteMany();
    await this.sala.deleteMany();
    await this.user.deleteMany();
  }
}
