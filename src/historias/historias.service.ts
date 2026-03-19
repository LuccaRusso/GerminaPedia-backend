// src/historias/historias.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoriaDto } from './dto/create-historia.dto';

@Injectable()
export class HistoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHistoriaDto) {
    const { alunoIds, eventoIds, ...data } = dto;
    return this.prisma.historia.create({
      data: {
        ...data,
        data: dto.data ? new Date(dto.data) : undefined,
        alunos: alunoIds ? { create: alunoIds.map((id) => ({ alunoId: id })) } : undefined,
        eventos: eventoIds ? { create: eventoIds.map((id) => ({ eventoId: id })) } : undefined,
      },
      include: this.historiaIncludes(),
    });
  }

  async findAll(params: { destaque?: boolean; search?: string; page?: number; limit?: number }) {
    const { destaque, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (destaque !== undefined) where.destaque = destaque;
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [historias, total] = await this.prisma.$transaction([
      this.prisma.historia.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.historiaIncludes(),
      }),
      this.prisma.historia.count({ where }),
    ]);

    return { data: historias, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const historia = await this.prisma.historia.findUnique({
      where: { id },
      include: this.historiaIncludes(),
    });
    if (!historia) throw new NotFoundException('História não encontrada');
    return historia;
  }

  async update(id: string, dto: Partial<CreateHistoriaDto>) {
    await this.findOne(id);
    const { alunoIds, eventoIds, ...data } = dto;
    return this.prisma.historia.update({
      where: { id },
      data: {
        ...data,
        ...(data.data && { data: new Date(data.data) }),
      },
      include: this.historiaIncludes(),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.historia.delete({ where: { id } });
    return { message: 'História removida com sucesso' };
  }

  private historiaIncludes() {
    return {
      alunos: { include: { aluno: { select: { id: true, nome: true } } } },
      eventos: { include: { evento: { select: { id: true, titulo: true, dataInicio: true } } } },
      wiki: { select: { id: true, slug: true, titulo: true } },
    };
  }
}
