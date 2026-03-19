// src/search/search.service.ts
// Busca global — procura em wikis, alunos, salas, eventos e histórias de uma vez
// Decisão: Busca LIKE no PostgreSQL via Prisma. Para escalar, trocar por pg_trgm
// ou Elasticsearch (adicionar como melhoria futura sem mudar a API).

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WikiStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, limit = 10) {
    if (!query || query.trim().length < 2) {
      return { wikis: [], alunos: [], salas: [], eventos: [], historias: [] };
    }

    const q = query.trim();

    // Executa todas as buscas em paralelo para máxima performance
    const [wikis, alunos, salas, eventos, historias] = await Promise.all([
      this.prisma.wiki.findMany({
        where: {
          status: WikiStatus.PUBLISHED,
          OR: [
            { titulo: { contains: q, mode: 'insensitive' } },
            { resumo: { contains: q, mode: 'insensitive' } },
            { conteudo: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true, slug: true, titulo: true, resumo: true, tipo: true,
          updatedAt: true, tags: true,
        },
      }),

      this.prisma.aluno.findMany({
        where: {
          ativo: true,
          OR: [
            { nome: { contains: q, mode: 'insensitive' } },
            { matricula: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true, nome: true, matricula: true,
          sala: { select: { nome: true, ano: true } },
          wiki: { select: { slug: true } },
        },
      }),

      this.prisma.sala.findMany({
        where: {
          OR: [{ nome: { contains: q, mode: 'insensitive' } }],
        },
        take: limit,
        select: {
          id: true, nome: true, ano: true, turno: true,
          wiki: { select: { slug: true } },
        },
      }),

      this.prisma.evento.findMany({
        where: {
          OR: [
            { titulo: { contains: q, mode: 'insensitive' } },
            { descricao: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true, titulo: true, tipo: true, dataInicio: true,
          wiki: { select: { slug: true } },
        },
      }),

      this.prisma.historia.findMany({
        where: {
          OR: [
            { titulo: { contains: q, mode: 'insensitive' } },
            { descricao: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        select: {
          id: true, titulo: true, destaque: true,
          wiki: { select: { slug: true } },
        },
      }),
    ]);

    const total = wikis.length + alunos.length + salas.length + eventos.length + historias.length;

    return {
      query: q,
      total,
      wikis,
      alunos,
      salas,
      eventos,
      historias,
    };
  }
}
