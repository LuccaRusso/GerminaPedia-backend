// src/wikis/dto/create-wiki.dto.ts
import {
  IsString, IsEnum, IsOptional, IsArray, MinLength, IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WikiType, WikiStatus } from '@prisma/client';

export class CreateWikiDto {
  @ApiProperty({ example: 'turma-a-2022' })
  @IsString()
  @MinLength(3)
  slug: string;

  @ApiProperty({ example: 'Turma A — 2022' })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiPropertyOptional({ example: 'Página oficial da Turma A de 2022' })
  @IsOptional()
  @IsString()
  resumo?: string;

  @ApiProperty({ example: '# Turma A\n\nConteúdo em **Markdown**' })
  @IsString()
  @MinLength(1)
  conteudo: string;

  @ApiProperty({ enum: WikiType })
  @IsEnum(WikiType)
  tipo: WikiType;

  @ApiPropertyOptional({ enum: WikiStatus, default: WikiStatus.DRAFT })
  @IsOptional()
  @IsEnum(WikiStatus)
  status?: WikiStatus;

  @ApiPropertyOptional({ example: ['turma', '2022'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'uuid-da-sala' })
  @IsOptional()
  @IsString()
  salaId?: string;

  @ApiPropertyOptional({ example: 'uuid-do-aluno' })
  @IsOptional()
  @IsString()
  alunoId?: string;

  @ApiPropertyOptional({ example: 'uuid-do-evento' })
  @IsOptional()
  @IsString()
  eventoId?: string;

  @ApiPropertyOptional({ example: 'uuid-da-historia' })
  @IsOptional()
  @IsString()
  historiaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imagemUrl?: string;

  @ApiPropertyOptional({ example: 'Criação inicial da wiki' })
  @IsOptional()
  @IsString()
  comentarioVersao?: string;
}
