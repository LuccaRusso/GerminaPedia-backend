// src/wikis/wikis.service.ts
// Contém toda a lógica de negócio das wikis:
//   - CRUD com versionamento automático
//   - Publicação de eventos real-time via WebSocket
//   - Controle de concorrência com número de versão

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WikiGateway } from '../websocket/wiki.gateway';
import { CreateWikiDto } from './dto/create-wiki.dto';
import { UpdateWikiDto } from './dto/update-wiki.dto';
import { WikiStatus } from '@prisma/client';

@Injectable()
export class WikisService {
  private readonly logger = new Logger(WikisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wikiGateway: WikiGateway,
  ) {}

  // ─── CRIAR WIKI ──────────────────────────────────────────
  async create(dto: CreateWikiDto, userId: string) {
    // Verifica se slug já existe
    const existing = await this.prisma.wiki.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" já está em uso`);
    }

    // ── Auto-cria a entidade correspondente se não foi vinculada manualmente ──
    // Garante que toda wiki com tipo específico tenha sua entidade na tabela certa.
    let resolvedSalaId     = dto.salaId;
    let resolvedAlunoId    = dto.alunoId;
    let resolvedEventoId   = dto.eventoId;
    let resolvedHistoriaId = dto.historiaId;

    const anoAtual = new Date().getFullYear();

    if (dto.tipo === 'SALA' && !dto.salaId) {
      // Cria a Sala automaticamente com os dados da wiki
      const sala = await this.prisma.sala.create({
        data: {
          nome: dto.titulo,
          ano: dto.extraAno ?? anoAtual,
          descricao: dto.resumo,
          turno: dto.extraTurno,
        },
      });
      resolvedSalaId = sala.id;
      this.logger.log(`Sala auto-criada: "${sala.nome}" (${sala.ano}) para wiki ${dto.slug}`);
    }

    if (dto.tipo === 'ALUNO' && !dto.alunoId) {
      // Aluno precisa de uma sala — usa salaId fornecida; sem ela, cria sala genérica
      let salaParaAluno = resolvedSalaId;
      if (!salaParaAluno) {
        const sala = await this.prisma.sala.create({
          data: {
            nome: `Turma — ${anoAtual}`,
            ano: anoAtual,
            descricao: 'Turma criada automaticamente',
          },
        });
        salaParaAluno = sala.id;
        resolvedSalaId = sala.id;
        this.logger.log(`Sala genérica auto-criada para aluno: ${sala.id}`);
      }
      const aluno = await this.prisma.aluno.create({
        data: {
          nome: dto.titulo,
          matricula: dto.extraMatricula,
          bio: dto.resumo,
          salaId: salaParaAluno,
        },
      });
      resolvedAlunoId = aluno.id;
      this.logger.log(`Aluno auto-criado: "${aluno.nome}" para wiki ${dto.slug}`);
    }

    if (dto.tipo === 'EVENTO' && !dto.eventoId) {
      const evento = await this.prisma.evento.create({
        data: {
          titulo: dto.titulo,
          descricao: dto.resumo,
          dataInicio: dto.extraDataInicio ? new Date(dto.extraDataInicio) : new Date(),
          tipo: dto.extraTipoEvento,
          local: dto.extraLocal,
        },
      });
      resolvedEventoId = evento.id;
      this.logger.log(`Evento auto-criado: "${evento.titulo}" para wiki ${dto.slug}`);
    }

    if (dto.tipo === 'HISTORIA' && !dto.historiaId) {
      const historia = await this.prisma.historia.create({
        data: {
          titulo: dto.titulo,
          descricao: dto.resumo,
          destaque: dto.extraDestaque ?? false,
        },
      });
      resolvedHistoriaId = historia.id;
      this.logger.log(`História auto-criada: "${historia.titulo}" para wiki ${dto.slug}`);
    }

    // ── Cria a Wiki vinculada à entidade (nova ou existente) ──
    const wiki = await this.prisma.wiki.create({
      data: {
        slug: dto.slug,
        titulo: dto.titulo,
        resumo: dto.resumo,
        conteudo: dto.conteudo,
        tipo: dto.tipo,
        status: dto.status ?? WikiStatus.PUBLISHED,
        tags: dto.tags ?? [],
        imagemUrl: dto.imagemUrl,
        criadoPorId: userId,
        editadoPorId: userId,
        ...(resolvedSalaId    && { sala:    { connect: { id: resolvedSalaId } } }),
        ...(resolvedAlunoId   && { aluno:   { connect: { id: resolvedAlunoId } } }),
        ...(resolvedEventoId  && { evento:  { connect: { id: resolvedEventoId } } }),
        ...(resolvedHistoriaId && { historia: { connect: { id: resolvedHistoriaId } } }),
        versoes: {
          create: {
            titulo: dto.titulo,
            conteudo: dto.conteudo,
            numero: 1,
            autorId: userId,
            comentario: dto.comentarioVersao ?? 'Versão inicial',
          },
        },
      },
      include: this.wikiIncludes(),
    });

    this.logger.log(`Wiki criada: ${wiki.slug} (tipo: ${wiki.tipo}) por ${userId}`);
    this.wikiGateway.emitWikiCreated(wiki);

    return wiki;
  }

  // ─── LISTAR (com filtros) ────────────────────────────────
  async findAll(params: {
    tipo?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { tipo, status, page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    else where.status = WikiStatus.PUBLISHED; // por padrão só mostra publicadas

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { resumo: { contains: search, mode: 'insensitive' } },
        { conteudo: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const [wikis, total] = await this.prisma.$transaction([
      this.prisma.wiki.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: this.wikiIncludes(),
      }),
      this.prisma.wiki.count({ where }),
    ]);

    return {
      data: wikis,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── BUSCAR POR SLUG ─────────────────────────────────────
  async findBySlug(slug: string) {
    const wiki = await this.prisma.wiki.findUnique({
      where: { slug },
      include: this.wikiIncludes(),
    });

    if (!wiki) throw new NotFoundException(`Wiki "${slug}" não encontrada`);

    // Incrementa visualizações (fire-and-forget, não bloqueia resposta)
    this.prisma.wiki.update({
      where: { slug },
      data: { visualizacoes: { increment: 1 } },
    }).catch(() => {}); // ignora erro de contagem

    return wiki;
  }

  // ─── BUSCAR POR ID ───────────────────────────────────────
  async findById(id: string) {
    const wiki = await this.prisma.wiki.findUnique({
      where: { id },
      include: this.wikiIncludes(),
    });
    if (!wiki) throw new NotFoundException('Wiki não encontrada');
    return wiki;
  }

  // ─── ATUALIZAR WIKI (gera nova versão) ───────────────────
  async update(id: string, dto: UpdateWikiDto, userId: string) {
    const wiki = await this.findById(id);

    // Calcula o próximo número de versão
    const lastVersion = await this.prisma.wikiVersion.findFirst({
      where: { wikiId: id },
      orderBy: { numero: 'desc' },
    });
    const nextVersionNumber = (lastVersion?.numero ?? 0) + 1;

    const updated = await this.prisma.wiki.update({
      where: { id },
      data: {
        ...(dto.titulo && { titulo: dto.titulo }),
        ...(dto.resumo !== undefined && { resumo: dto.resumo }),
        ...(dto.conteudo && { conteudo: dto.conteudo }),
        ...(dto.status && { status: dto.status }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.imagemUrl !== undefined && { imagemUrl: dto.imagemUrl }),
        editadoPorId: userId,
        // Cria nova versão no histórico
        versoes: {
          create: {
            titulo: dto.titulo ?? wiki.titulo,
            conteudo: dto.conteudo ?? wiki.conteudo,
            numero: nextVersionNumber,
            autorId: userId,
            comentario: dto.comentarioVersao ?? `Edição #${nextVersionNumber}`,
          },
        },
      },
      include: this.wikiIncludes(),
    });

    this.logger.log(`Wiki atualizada: ${updated.slug} (v${nextVersionNumber}) por ${userId}`);

    // Emite atualização real-time — todos os usuários que estão vendo essa wiki recebem
    this.wikiGateway.emitWikiUpdated(updated);

    return updated;
  }

  // ─── DELETAR WIKI ────────────────────────────────────────
  async remove(id: string) {
    await this.findById(id); // Garante que existe antes de deletar
    await this.prisma.wiki.delete({ where: { id } });
    this.wikiGateway.emitWikiDeleted(id);
    return { message: 'Wiki deletada com sucesso' };
  }

  // ─── HISTÓRICO DE VERSÕES ────────────────────────────────
  async getVersionHistory(wikiId: string) {
    await this.findById(wikiId);
    return this.prisma.wikiVersion.findMany({
      where: { wikiId },
      orderBy: { numero: 'desc' },
      include: {
        autor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ─── RESTAURAR VERSÃO ────────────────────────────────────
  async restoreVersion(wikiId: string, versionId: string, userId: string) {
    const version = await this.prisma.wikiVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.wikiId !== wikiId) {
      throw new NotFoundException('Versão não encontrada para esta wiki');
    }

    return this.update(
      wikiId,
      {
        titulo: version.titulo,
        conteudo: version.conteudo,
        comentarioVersao: `Restaurado para versão #${version.numero}`,
      },
      userId,
    );
  }

  // ─── Includes padrão (evita repetição) ──────────────────
  private wikiIncludes() {
    return {
      criadoPor: { select: { id: true, name: true, email: true, avatar: true } },
      editadoPor: { select: { id: true, name: true, email: true, avatar: true } },
      aluno: { select: { id: true, nome: true, sala: { select: { nome: true, ano: true } } } },
      sala: { select: { id: true, nome: true, ano: true } },
      evento: { select: { id: true, titulo: true, dataInicio: true } },
      historia: { select: { id: true, titulo: true } },
      comentarios: {
        include: { autor: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' as const },
        take: 50,
      },
      _count: { select: { versoes: true, comentarios: true } },
    };
  }
}
