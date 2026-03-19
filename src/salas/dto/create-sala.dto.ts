// src/salas/dto/create-sala.dto.ts
import { IsString, IsInt, IsOptional, Min, Max, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaDto {
  @ApiProperty({ example: 'Turma A' })
  @IsString()
  @MinLength(1)
  nome: string;

  @ApiProperty({ example: 2022 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano: number;

  @ApiPropertyOptional({ example: 'Turma matutina com foco em ciências' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 'Manhã' })
  @IsOptional()
  @IsString()
  turno?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;
}
