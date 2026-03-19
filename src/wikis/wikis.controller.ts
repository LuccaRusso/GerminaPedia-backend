// src/wikis/wikis.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body,
  UseGuards, Query, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { WikisService } from './wikis.service';
import { CreateWikiDto } from './dto/create-wiki.dto';
import { UpdateWikiDto } from './dto/update-wiki.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('wikis')
@Controller('wikis')
export class WikisController {
  constructor(private readonly wikisService: WikisService) {}

  // GET /api/v1/wikis — público
  @Get()
  @ApiOperation({ summary: 'Listar wikis publicadas (com filtros)' })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.wikisService.findAll({
      tipo,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
  }

  // GET /api/v1/wikis/id/:id — busca por ID (para o editor)
  @Get('id/:id')
  @ApiOperation({ summary: 'Buscar wiki pelo ID' })
  findById(@Param('id') id: string) {
    return this.wikisService.findById(id);
  }

  // GET /api/v1/wikis/:slug — público
  @Get(':slug')
  @ApiOperation({ summary: 'Buscar wiki pelo slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.wikisService.findBySlug(slug);
  }

  // POST /api/v1/wikis — qualquer usuário logado
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Criar nova wiki (qualquer usuário logado)' })
  create(@Body() dto: CreateWikiDto, @CurrentUser() user: any) {
    return this.wikisService.create(dto, user.id);
  }

  // PUT /api/v1/wikis/:id — autor ou ADMIN/EDITOR
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Atualizar wiki — autor ou ADMIN/EDITOR' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWikiDto,
    @CurrentUser() user: any,
  ) {
    const wiki = await this.wikisService.findById(id);
    const isOwner = wiki.criadoPorId === user.id;
    const isPrivileged = user.role === 'ADMIN' || user.role === 'EDITOR';
    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('Você só pode editar wikis que criou');
    }
    return this.wikisService.update(id, dto, user.id);
  }

  // DELETE /api/v1/wikis/:id — autor ou ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar wiki — autor ou ADMIN' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const wiki = await this.wikisService.findById(id);
    const isOwner = wiki.criadoPorId === user.id;
    const isAdmin = user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Você só pode deletar wikis que criou');
    }
    return this.wikisService.remove(id);
  }

  // GET /api/v1/wikis/:id/versions — público
  @Get(':id/versions')
  @ApiOperation({ summary: 'Histórico de versões da wiki' })
  getVersionHistory(@Param('id') id: string) {
    return this.wikisService.getVersionHistory(id);
  }

  // POST /api/v1/wikis/:id/versions/:versionId/restore — ADMIN/EDITOR
  @Post(':id/versions/:versionId/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Restaurar uma versão anterior da wiki' })
  restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: any,
  ) {
    return this.wikisService.restoreVersion(id, versionId, user.id);
  }
}
