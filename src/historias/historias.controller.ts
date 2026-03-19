// src/historias/historias.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HistoriasService } from './historias.service';
import { CreateHistoriaDto } from './dto/create-historia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('historias')
@Controller('historias')
export class HistoriasController {
  constructor(private readonly historiasService: HistoriasService) {}

  @Get()
  findAll(
    @Query('destaque') destaque?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
  ) {
    return this.historiasService.findAll({
      destaque: destaque === 'true' ? true : destaque === 'false' ? false : undefined,
      search,
      page,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historiasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth('JWT')
  create(@Body() dto: CreateHistoriaDto) {
    return this.historiasService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @ApiBearerAuth('JWT')
  update(@Param('id') id: string, @Body() dto: Partial<CreateHistoriaDto>) {
    return this.historiasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  remove(@Param('id') id: string) {
    return this.historiasService.remove(id);
  }
}
