// src/wikis/dto/create-wiki.dto.ts
import {
  IsString, IsEnum, IsOptional, IsArray, MinLength, IsUrl,
  IsInt, IsBoolean, IsDateString, Min, Max,
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

  @ApiPropertyOptional({ enum: WikiStatus, default: WikiStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(WikiStatus)
  status?: WikiStatus;

  @ApiPropertyOptional({ example: ['turma', '2022'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // ─── FKs para vincular entidades já existentes ───────────────
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

  // ─── Campos extras para auto-criação da entidade ─────────────
  // Usados quando o usuário não vinculou uma entidade existente

  @ApiPropertyOptional({ example: 2025, description: 'Ano da sala (tipo=SALA)' })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  extraAno?: number;

  @ApiPropertyOptional({ example: 'Manhã', description: 'Turno da sala (tipo=SALA)' })
  @IsOptional()
  @IsString()
  extraTurno?: string;

  @ApiPropertyOptional({ example: '2022001', description: 'Matrícula do aluno (tipo=ALUNO)' })
  @IsOptional()
  @IsString()
  extraMatricula?: string;

  @ApiPropertyOptional({ example: '2022-12-10', description: 'Data do evento (tipo=EVENTO)' })
  @IsOptional()
  @IsDateString()
  extraDataInicio?: string;

  @ApiPropertyOptional({ example: 'Formatura', description: 'Tipo do evento (tipo=EVENTO)' })
  @IsOptional()
  @IsString()
  extraTipoEvento?: string;

  @ApiPropertyOptional({ example: 'Auditório', description: 'Local do evento (tipo=EVENTO)' })
  @IsOptional()
  @IsString()
  extraLocal?: string;

  @ApiPropertyOptional({ example: false, description: 'Destaque na home (tipo=HISTORIA)' })
  @IsOptional()
  @IsBoolean()
  extraDestaque?: boolean;
}

