-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- CreateEnum
CREATE TYPE "WikiType" AS ENUM ('ALUNO', 'SALA', 'EVENTO', 'HISTORIA', 'GERAL');

-- CreateEnum
CREATE TYPE "WikiStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'READER',
    "avatar" TEXT,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "descricao" TEXT,
    "turno" TEXT,
    "capacidade" INTEGER,
    "imagemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wikiId" TEXT,

    CONSTRAINT "salas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "dataNasc" TIMESTAMP(3),
    "fotoUrl" TEXT,
    "bio" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "salaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wikiId" TEXT,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "local" TEXT,
    "tipo" TEXT,
    "imagemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wikiId" TEXT,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_salas" (
    "eventoId" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,

    CONSTRAINT "eventos_salas_pkey" PRIMARY KEY ("eventoId","salaId")
);

-- CreateTable
CREATE TABLE "eventos_alunos" (
    "eventoId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "eventos_alunos_pkey" PRIMARY KEY ("eventoId","alunoId")
);

-- CreateTable
CREATE TABLE "historias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3),
    "imagemUrl" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "wikiId" TEXT,

    CONSTRAINT "historias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historias_alunos" (
    "historiaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "historias_alunos_pkey" PRIMARY KEY ("historiaId","alunoId")
);

-- CreateTable
CREATE TABLE "historias_eventos" (
    "historiaId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,

    CONSTRAINT "historias_eventos_pkey" PRIMARY KEY ("historiaId","eventoId")
);

-- CreateTable
CREATE TABLE "wikis" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT,
    "conteudo" TEXT NOT NULL,
    "tipo" "WikiType" NOT NULL,
    "status" "WikiStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "imagemUrl" TEXT,
    "criadoPorId" TEXT NOT NULL,
    "editadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wikis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wiki_versions" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "comentario" TEXT,
    "diff" TEXT,
    "wikiId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wiki_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "wikiId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "salas_wikiId_key" ON "salas"("wikiId");

-- CreateIndex
CREATE UNIQUE INDEX "salas_nome_ano_key" ON "salas"("nome", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_matricula_key" ON "alunos"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_wikiId_key" ON "alunos"("wikiId");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_wikiId_key" ON "eventos"("wikiId");

-- CreateIndex
CREATE UNIQUE INDEX "historias_wikiId_key" ON "historias"("wikiId");

-- CreateIndex
CREATE UNIQUE INDEX "wikis_slug_key" ON "wikis"("slug");

-- CreateIndex
CREATE INDEX "wiki_versions_wikiId_numero_idx" ON "wiki_versions"("wikiId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "tags_nome_key" ON "tags"("nome");

-- AddForeignKey
ALTER TABLE "salas" ADD CONSTRAINT "salas_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "salas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_salas" ADD CONSTRAINT "eventos_salas_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_salas" ADD CONSTRAINT "eventos_salas_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "salas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_alunos" ADD CONSTRAINT "eventos_alunos_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_alunos" ADD CONSTRAINT "eventos_alunos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias" ADD CONSTRAINT "historias_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_alunos" ADD CONSTRAINT "historias_alunos_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "historias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_alunos" ADD CONSTRAINT "historias_alunos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_eventos" ADD CONSTRAINT "historias_eventos_historiaId_fkey" FOREIGN KEY ("historiaId") REFERENCES "historias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historias_eventos" ADD CONSTRAINT "historias_eventos_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wikis" ADD CONSTRAINT "wikis_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wikis" ADD CONSTRAINT "wikis_editadoPorId_fkey" FOREIGN KEY ("editadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_versions" ADD CONSTRAINT "wiki_versions_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_versions" ADD CONSTRAINT "wiki_versions_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_wikiId_fkey" FOREIGN KEY ("wikiId") REFERENCES "wikis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
