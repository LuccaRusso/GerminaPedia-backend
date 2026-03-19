// src/wikis/wikis.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body,
  UseGuards, Query, HttpCode, HttpStatus,
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.wikisService.findAll({ tipo, status, page, limit, search });
  }

  // GET /api/v1/wikis/:slug — público
  @Get(':slug')
  @ApiOperation({ summary: 'Buscar wiki pelo slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.wikisService.findBySlug(slug);
  }

  // POST /api/v1/wikis — apenas ADMIN e EDITOR
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Criar nova wiki (ADMIN/EDITOR)' })
  create(@Body() dto: CreateWikiDto, @CurrentUser() user: any) {
    return this.wikisService.create(dto, user.id);
  }

  // PUT /api/v1/wikis/:id — apenas ADMIN e EDITOR
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Atualizar wiki — gera nova versão no histórico' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWikiDto,
    @CurrentUser() user: any,
  ) {
    return this.wikisService.update(id, dto, user.id);
  }

  // DELETE /api/v1/wikis/:id — apenas ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar wiki (apenas ADMIN)' })
  remove(@Param('id') id: string) {
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
