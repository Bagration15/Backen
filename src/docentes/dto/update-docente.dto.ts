import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateDocenteDto {
  @IsOptional()
  @IsString({ message: 'El número de cédula debe ser una cadena de texto' })
  @Matches(/^[0-9]+$/, { message: 'El número de cédula debe contener solo números' })
  @MinLength(7, { message: 'El número de cédula debe tener al menos 7 dígitos' })
  numeroCedula?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  departamento?: string;

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser una cadena de texto' })
  especialidad?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @IsOptional()
  activo?: boolean;
}

