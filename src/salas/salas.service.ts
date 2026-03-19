// src/salas/salas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';

@Injectable()
export class SalasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSalaDto) {
    return this.prisma.sala.create({
      data: dto,
      include: { alunos: true },
    });
  }

  async findAll(params: { ano?: number; search?: string; page?: number; limit?: number }) {
    const { ano, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (ano) where.ano = ano;
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [salas, total] = await this.prisma.$transaction([
      this.prisma.sala.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ ano: 'desc' }, { nome: 'asc' }],
        include: {
          wiki: { select: { id: true, slug: true, titulo: true } },
          _count: { select: { alunos: true, eventos: true } },
        },
      }),
      this.prisma.sala.count({ where }),
    ]);

    return { data: salas, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const sala = await this.prisma.sala.findUnique({
      where: { id },
      include: {
        alunos: true,
        wiki: true,
        eventos: { include: { evento: true } },
        _count: { select: { alunos: true } },
      },
    });
    if (!sala) throw new NotFoundException('Sala não encontrada');
    return sala;
  }

  async update(id: string, dto: Partial<CreateSalaDto>) {
    await this.findOne(id);
    return this.prisma.sala.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.sala.delete({ where: { id } });
    return { message: 'Sala removida com sucesso' };
  }

  // Retorna anos disponíveis (para filtros na UI)
  async getAnosDisponiveis() {
    const result = await this.prisma.sala.groupBy({
      by: ['ano'],
      orderBy: { ano: 'desc' },
    });
    return result.map((r) => r.ano);
  }
}
