import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('alunos')
@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alunos (público)' })
  findAll(
    @Query('salaId') salaId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.alunosService.findAll({
      salaId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar aluno por ID' })
  findOne(@Param('id') id: string) {
    return this.alunosService.findOne(id);
  }

  // Qualquer usuário logado pode criar
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  create(@Body() dto: CreateAlunoDto) {
    return this.alunosService.create(dto);
  }

  // Qualquer logado pode editar (sem ownership em alunos — são entidades da escola)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  update(@Param('id') id: string, @Body() dto: Partial<CreateAlunoDto>) {
    return this.alunosService.update(id, dto);
  }

  // Apenas ADMIN deleta
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  remove(@Param('id') id: string) {
    return this.alunosService.remove(id);
  }
}
