import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Get()
  findAll(
    @Query('ano') ano?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salasService.findAll({
      ano: ano ? parseInt(ano, 10) : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('anos')
  @ApiOperation({ summary: 'Listar anos disponíveis (para filtros)' })
  getAnos() {
    return this.salasService.getAnosDisponiveis();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salasService.findOne(id);
  }

  // Qualquer logado pode criar
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  create(@Body() dto: CreateSalaDto) {
    return this.salasService.create(dto);
  }

  // Qualquer logado pode editar
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSalaDto>) {
    return this.salasService.update(id, dto);
  }

  // Apenas ADMIN deleta
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  remove(@Param('id') id: string) {
    return this.salasService.remove(id);
  }
}
