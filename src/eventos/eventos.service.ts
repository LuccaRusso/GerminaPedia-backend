// src/eventos/eventos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventoDto) {
    const { salaIds, alunoIds, ...data } = dto;
    return this.prisma.evento.create({
      data: {
        ...data,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
        salas: salaIds
          ? { create: salaIds.map((id) => ({ salaId: id })) }
          : undefined,
        alunos: alunoIds
          ? { create: alunoIds.map((id) => ({ alunoId: id })) }
          : undefined,
      },
      include: this.eventoIncludes(),
    });
  }

  async findAll(params: { tipo?: string; search?: string; page?: number; limit?: number }) {
    const { tipo, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (tipo) where.tipo = tipo;
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { tipo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [eventos, total] = await this.prisma.$transaction([
      this.prisma.evento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dataInicio: 'desc' },
        include: this.eventoIncludes(),
      }),
      this.prisma.evento.count({ where }),
    ]);

    return { data: eventos, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const evento = await this.prisma.evento.findUnique({
      where: { id },
      include: this.eventoIncludes(),
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  async update(id: string, dto: Partial<CreateEventoDto>) {
    await this.findOne(id);
    const { salaIds, alunoIds, ...data } = dto;
    return this.prisma.evento.update({
      where: { id },
      data: {
        ...data,
        ...(data.dataInicio && { dataInicio: new Date(data.dataInicio) }),
        ...(data.dataFim && { dataFim: new Date(data.dataFim) }),
      },
      include: this.eventoIncludes(),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.evento.delete({ where: { id } });
    return { message: 'Evento removido com sucesso' };
  }

  private eventoIncludes() {
    return {
      salas: { include: { sala: { select: { id: true, nome: true, ano: true } } } },
      alunos: { include: { aluno: { select: { id: true, nome: true } } } },
      wiki: { select: { id: true, slug: true, titulo: true } },
      historias: { include: { historia: { select: { id: true, titulo: true } } } },
    };
  }
}
