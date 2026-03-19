// src/app.module.ts
// Módulo raiz — importa todos os módulos da aplicação

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WikisModule } from './wikis/wikis.module';
import { AlunosModule } from './alunos/alunos.module';
import { SalasModule } from './salas/salas.module';
import { EventosModule } from './eventos/eventos.module';
import { HistoriasModule } from './historias/historias.module';
import { SearchModule } from './search/search.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    // ConfigModule global: carrega variáveis de ambiente (.env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WikisModule,
    AlunosModule,
    SalasModule,
    EventosModule,
    HistoriasModule,
    SearchModule,
    WebsocketModule,
  ],
})
export class AppModule {}
