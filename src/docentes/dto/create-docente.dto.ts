import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateDocenteDto {
  @IsNotEmpty({ message: 'El número de cédula es requerido' })
  @IsString({ message: 'El número de cédula debe ser una cadena de texto' })
  @Matches(/^[0-9]+$/, { message: 'El número de cédula debe contener solo números' })
  @MinLength(7, { message: 'El número de cédula debe tener al menos 7 dígitos' })
  numeroCedula: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'El departamento es requerido' })
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  departamento: string;

  @IsOptional()
  @IsString({ message: 'La especialidad debe ser una cadena de texto' })
  especialidad?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @IsOptional()
  activo?: boolean;
}

