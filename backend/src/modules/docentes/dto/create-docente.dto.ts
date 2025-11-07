import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocenteDto {
  @IsNotEmpty() @IsString()
  cedula: string;

  @IsNotEmpty() @IsString()
  nombre: string;

  @IsNotEmpty() @IsEmail()
  email: string;

  @IsOptional() @IsString()
  telefono?: string;

  @IsOptional() @IsString()
  departamentoAcademico?: string;

  @IsOptional() @IsString()
  tituloAcademico?: string;
}
