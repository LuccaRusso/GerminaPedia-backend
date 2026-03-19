// src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Busca global em wikis, alunos, salas, eventos e histórias' })
  @ApiQuery({ name: 'q', description: 'Termo de busca (mínimo 2 caracteres)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(@Query('q') q: string, @Query('limit') limit?: number) {
    return this.searchService.globalSearch(q, limit);
  }
}
