// src/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, bio: true, isActive: true, createdAt: true,
        wikisCreated: { select: { id: true, slug: true, titulo: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  // Apenas ADMIN pode alterar roles
  async updateRole(id: string, role: Role, requesterId: string) {
    if (id === requesterId) throw new ForbiddenException('Não é possível alterar seu próprio role');
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async updateProfile(id: string, data: { name?: string; bio?: string; avatar?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
