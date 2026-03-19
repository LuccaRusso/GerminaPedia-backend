// src/main.ts
// Ponto de entrada da aplicação NestJS
// Configura Swagger, CORS, pipes de validação e segurança

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  // ─── Segurança ───────────────────────────────────────────
  app.use(
    helmet({
      // Permite WebSocket e imagens inline no Swagger
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ─── CORS ────────────────────────────────────────────────
  // Permite o frontend React e ferramentas de dev
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Prefixo global da API ───────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Validação automática de DTOs ───────────────────────
  // whitelist: remove campos não declarados no DTO
  // forbidNonWhitelisted: lança erro se vier campo extra
  // transform: converte automaticamente tipos (string→number, etc)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger / OpenAPI ───────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GerminaPedia API')
    .setDescription(
      'API da plataforma colaborativa GerminaPedia — wikis de alunos, salas, eventos e histórias',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('wikis', 'CRUD de wikis e histórico de versões')
    .addTag('alunos', 'Gerenciamento de alunos')
    .addTag('salas', 'Gerenciamento de salas/turmas')
    .addTag('eventos', 'Gerenciamento de eventos/acontecimentos')
    .addTag('historias', 'Gerenciamento de histórias')
    .addTag('search', 'Busca global')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 GerminaPedia API rodando em: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
