// src/alunos/alunos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';

@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlunoDto) {
    return this.prisma.aluno.create({
      data: dto,
      include: { sala: true, wiki: true },
    });
  }

  async findAll(params: { salaId?: string; search?: string; page?: number; limit?: number }) {
    const { salaId, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: any = { ativo: true };
    if (salaId) where.salaId = salaId;
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { matricula: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [alunos, total] = await this.prisma.$transaction([
      this.prisma.aluno.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
        include: {
          sala: { select: { id: true, nome: true, ano: true } },
          wiki: { select: { id: true, slug: true, titulo: true } },
        },
      }),
      this.prisma.aluno.count({ where }),
    ]);

    return { data: alunos, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id },
      include: {
        sala: true,
        wiki: true,
        eventos: { include: { evento: true } },
        historias: { include: { historia: true } },
      },
    });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    return aluno;
  }

  async update(id: string, dto: Partial<CreateAlunoDto>) {
    await this.findOne(id);
    return this.prisma.aluno.update({ where: { id }, data: dto, include: { sala: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.aluno.update({ where: { id }, data: { ativo: false } });
    return { message: 'Aluno desativado com sucesso' };
  }
}
