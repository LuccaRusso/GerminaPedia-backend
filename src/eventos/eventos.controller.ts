import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    return this.eventosService.findAll({
      tipo,
      search,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }

  // Qualquer logado pode criar
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  create(@Body() dto: CreateEventoDto) {
    return this.eventosService.create(dto);
  }

  // Qualquer logado pode editar
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  update(@Param('id') id: string, @Body() dto: Partial<CreateEventoDto>) {
    return this.eventosService.update(id, dto);
  }

  // Apenas ADMIN deleta
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  remove(@Param('id') id: string) {
    return this.eventosService.remove(id);
  }
}
