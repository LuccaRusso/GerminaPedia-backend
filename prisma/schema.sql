-- ============================================================
-- GerminaPedia — Script SQL Completo
-- PostgreSQL 15+
-- Este arquivo é gerado para referência.
-- Em produção, usar: npm run prisma:migrate:deploy
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'READER');
CREATE TYPE "WikiType" AS ENUM ('ALUNO', 'SALA', 'EVENTO', 'HISTORIA', 'GERAL');
CREATE TYPE "WikiStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Users
CREATE TABLE "users" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email"     TEXT UNIQUE NOT NULL,
  "name"      TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "role"      "Role" NOT NULL DEFAULT 'READER',
  "avatar"    TEXT,
  "bio"       TEXT,
  "isActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Salas
CREATE TABLE "salas" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nome"       TEXT NOT NULL,
  "ano"        INTEGER NOT NULL,
  "descricao"  TEXT,
  "turno"      TEXT,
  "capacidade" INTEGER,
  "imagemUrl"  TEXT,
  "wikiId"     UUID UNIQUE,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("nome", "ano")
);

-- Alunos
CREATE TABLE "alunos" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nome"       TEXT NOT NULL,
  "matricula"  TEXT UNIQUE,
  "email"      TEXT,
  "telefone"   TEXT,
  "dataNasc"   TIMESTAMP,
  "fotoUrl"    TEXT,
  "bio"        TEXT,
  "ativo"      BOOLEAN NOT NULL DEFAULT TRUE,
  "salaId"     UUID NOT NULL REFERENCES "salas"("id"),
  "wikiId"     UUID UNIQUE,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Eventos
CREATE TABLE "eventos" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "titulo"      TEXT NOT NULL,
  "descricao"   TEXT,
  "dataInicio"  TIMESTAMP NOT NULL,
  "dataFim"     TIMESTAMP,
  "local"       TEXT,
  "tipo"        TEXT,
  "imagemUrl"   TEXT,
  "wikiId"      UUID UNIQUE,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Historias
CREATE TABLE "historias" (
  "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "titulo"      TEXT NOT NULL,
  "descricao"   TEXT,
  "data"        TIMESTAMP,
  "imagemUrl"   TEXT,
  "destaque"    BOOLEAN NOT NULL DEFAULT FALSE,
  "wikiId"      UUID UNIQUE,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Wikis
CREATE TABLE "wikis" (
  "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "slug"          TEXT UNIQUE NOT NULL,
  "titulo"        TEXT NOT NULL,
  "resumo"        TEXT,
  "conteudo"      TEXT NOT NULL,
  "tipo"          "WikiType" NOT NULL,
  "status"        "WikiStatus" NOT NULL DEFAULT 'DRAFT',
  "tags"          TEXT[] NOT NULL DEFAULT '{}',
  "visualizacoes" INTEGER NOT NULL DEFAULT 0,
  "imagemUrl"     TEXT,
  "criadoPorId"   UUID NOT NULL REFERENCES "users"("id"),
  "editadoPorId"  UUID REFERENCES "users"("id"),
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- FK: salas, alunos, eventos, historias -> wikis (1:1)
ALTER TABLE "salas"     ADD CONSTRAINT "salas_wikiId_fkey"     FOREIGN KEY ("wikiId") REFERENCES "wikis"("id");
ALTER TABLE "alunos"    ADD CONSTRAINT "alunos_wikiId_fkey"    FOREIGN KEY ("wikiId") REFERENCES "wikis"("id");
ALTER TABLE "eventos"   ADD CONSTRAINT "eventos_wikiId_fkey"   FOREIGN KEY ("wikiId") REFERENCES "wikis"("id");
ALTER TABLE "historias" ADD CONSTRAINT "historias_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id");

-- Wiki Versions
CREATE TABLE "wiki_versions" (
  "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "conteudo"   TEXT NOT NULL,
  "titulo"     TEXT NOT NULL,
  "numero"     INTEGER NOT NULL,
  "comentario" TEXT,
  "diff"       TEXT,
  "wikiId"     UUID NOT NULL REFERENCES "wikis"("id") ON DELETE CASCADE,
  "autorId"    UUID NOT NULL REFERENCES "users"("id"),
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX "wiki_versions_wikiId_numero_idx" ON "wiki_versions"("wikiId", "numero");

-- Comments
CREATE TABLE "comments" (
  "id"        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "conteudo"  TEXT NOT NULL,
  "isEdited"  BOOLEAN NOT NULL DEFAULT FALSE,
  "wikiId"    UUID NOT NULL REFERENCES "wikis"("id") ON DELETE CASCADE,
  "autorId"   UUID NOT NULL REFERENCES "users"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Pivots N:N
CREATE TABLE "eventos_salas" (
  "eventoId" UUID REFERENCES "eventos"("id") ON DELETE CASCADE,
  "salaId"   UUID REFERENCES "salas"("id")   ON DELETE CASCADE,
  PRIMARY KEY ("eventoId", "salaId")
);

CREATE TABLE "eventos_alunos" (
  "eventoId" UUID REFERENCES "eventos"("id") ON DELETE CASCADE,
  "alunoId"  UUID REFERENCES "alunos"("id")  ON DELETE CASCADE,
  PRIMARY KEY ("eventoId", "alunoId")
);

CREATE TABLE "historias_alunos" (
  "historiaId" UUID REFERENCES "historias"("id") ON DELETE CASCADE,
  "alunoId"    UUID REFERENCES "alunos"("id")    ON DELETE CASCADE,
  PRIMARY KEY ("historiaId", "alunoId")
);

CREATE TABLE "historias_eventos" (
  "historiaId" UUID REFERENCES "historias"("id") ON DELETE CASCADE,
  "eventoId"   UUID REFERENCES "eventos"("id")   ON DELETE CASCADE,
  PRIMARY KEY ("historiaId", "eventoId")
);

-- Tags (para autocomplete)
CREATE TABLE "tags" (
  "id"    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "nome"  TEXT UNIQUE NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0
);
