// src/wikis/dto/update-wiki.dto.ts
import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateWikiDto } from './create-wiki.dto';

export class UpdateWikiDto extends PartialType(CreateWikiDto) {
  @ApiPropertyOptional({ example: 'Corrigi informação sobre o evento' })
  @IsOptional()
  @IsString()
  comentarioVersao?: string;
}
