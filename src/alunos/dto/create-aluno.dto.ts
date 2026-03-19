// src/alunos/dto/create-aluno.dto.ts
import { IsString, IsOptional, IsEmail, IsDateString, IsBoolean, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlunoDto {
  @ApiProperty({ example: 'Ana Lima' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: 'uuid-da-sala' })
  @IsUUID()
  salaId: string;

  @ApiPropertyOptional({ example: '2022001' })
  @IsOptional()
  @IsString()
  matricula?: string;

  @ApiPropertyOptional({ example: 'ana@escola.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({ example: '2005-03-15' })
  @IsOptional()
  @IsDateString()
  dataNasc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}
