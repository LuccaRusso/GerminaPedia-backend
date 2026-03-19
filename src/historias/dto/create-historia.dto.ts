// src/historias/dto/create-historia.dto.ts
import { IsString, IsOptional, IsDateString, IsBoolean, IsArray, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHistoriaDto {
  @ApiProperty({ example: 'A história da GerminaPedia' })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: '2022-12-01' })
  @IsOptional()
  @IsDateString()
  data?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  destaque?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  alunoIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  eventoIds?: string[];
}
