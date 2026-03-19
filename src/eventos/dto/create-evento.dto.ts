// src/eventos/dto/create-evento.dto.ts
import { IsString, IsOptional, IsDateString, IsArray, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventoDto {
  @ApiProperty({ example: 'Formatura Turma A 2022' })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: '2022-12-10' })
  @IsDateString()
  dataInicio: string;

  @ApiPropertyOptional({ example: '2022-12-10' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ example: 'Auditório Principal' })
  @IsOptional()
  @IsString()
  local?: string;

  @ApiPropertyOptional({ example: 'Formatura' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  salaIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  alunoIds?: string[];
}
