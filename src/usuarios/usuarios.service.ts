import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { DocentesService } from '../docentes/docentes.service';
import { EstudiantesService } from '../estudiantes/estudiantes.service';
import { AdministradoresService } from '../administradores/administradores.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(
    private docentesService: DocentesService,
    private estudiantesService: EstudiantesService,
    private administradoresService: AdministradoresService,
  ) { }

  async createUser(createUserDto: {
    nombre: string;
    email: string;
    password: string;
    role: 'estudiante' | 'docente' | 'administrador';
    // Campos específicos de estudiante
    matricula?: string;
    carrera?: string;
    semestre?: number;
    // Campos específicos de docente
    numeroCedula?: string;
    departamento?: string;
    especialidad?: string;
    // Campos específicos de administrador
    cargo?: string;
    telefono?: string;
  }) {
    const { role, password, ...userData } = createUserDto;

    // Validar que el email no exista en ninguna colección
    await this.validateEmailUnique(createUserDto.email);

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario según su rol
    switch (role) {
      case 'estudiante':
        if (!createUserDto.matricula || !createUserDto.carrera || !createUserDto.semestre) {
          throw new BadRequestException('Estudiante requiere: matricula, carrera y semestre');
        }
        return this.estudiantesService.create({
          ...userData,
          matricula: createUserDto.matricula,
          carrera: createUserDto.carrera,
          semestre: createUserDto.semestre,
          email: createUserDto.email,
        });

      case 'docente':
        if (!createUserDto.departamento) {
          throw new BadRequestException('Docente requiere: departamento');
        }
        if (!createUserDto.numeroCedula) {
          throw new BadRequestException('Docente requiere: numeroCedula');
        }
        // DocentesService.create() ya hashea la contraseña, así que pasamos la contraseña sin hashear
        return this.docentesService.create({
          numeroCedula: createUserDto.numeroCedula,
          nombre: createUserDto.nombre,
          email: createUserDto.email,
          password: createUserDto.password, // Pasar contraseña sin hashear, DocentesService la hasheará
          departamento: createUserDto.departamento,
          especialidad: createUserDto.especialidad,
          telefono: createUserDto.telefono,
          activo: true,
        });

      case 'administrador':
        return this.administradoresService.create({
          ...userData,
          password: hashedPassword,
          email: createUserDto.email,
          role: 'administrador',
          cargo: createUserDto.cargo,
        });

      default:
        throw new BadRequestException(`Rol inválido: ${role}. Roles válidos: estudiante, docente, administrador`);
    }
  }

  private async validateEmailUnique(email: string): Promise<void> {
    const [docente, estudiante, administrador] = await Promise.all([
      this.docentesService.findByEmail(email).catch(() => null),
      this.estudiantesService.findByEmail(email).catch(() => null),
      this.administradoresService.findByEmail(email).catch(() => null),
    ]);

    if (docente || estudiante || administrador) {
      const roles = [];
      if (docente) roles.push('docente');
      if (estudiante) roles.push('estudiante');
      if (administrador) roles.push('administrador');

      throw new ConflictException(
        `El email ${email} ya está registrado en el sistema como ${roles.join(', ')}. Por favor, use otro email.`
      );
    }
  }

  async findAllByRole(role: 'estudiante' | 'docente' | 'administrador') {
    switch (role) {
      case 'estudiante':
        return this.estudiantesService.findAll();
      case 'docente':
        return this.docentesService.findAll();
      case 'administrador':
        return this.administradoresService.findAll();
      default:
        throw new BadRequestException(`Rol inválido: ${role}`);
    }
  }

  async findUserByEmail(email: string) {
    const [docente, estudiante, administrador] = await Promise.all([
      this.docentesService.findByEmail(email).catch(() => null),
      this.estudiantesService.findByEmail(email).catch(() => null),
      this.administradoresService.findByEmail(email).catch(() => null),
    ]);

    return docente || estudiante || administrador || null;
  }

  async updateUser(id: string, role: 'estudiante' | 'docente' | 'administrador', updateUserDto: any) {
    // Si se está cambiando el email, validar que no exista
    if (updateUserDto.email) {
      const existingUser = await this.findUserByEmail(updateUserDto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('El email ya está registrado en el sistema');
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    switch (role) {
      case 'estudiante':
        return this.estudiantesService.update(id, updateUserDto);
      case 'docente':
        return this.docentesService.update(id, updateUserDto);
      case 'administrador':
        return this.administradoresService.update(id, updateUserDto);
      default:
        throw new BadRequestException(`Rol inválido: ${role}`);
    }
  }

  async deleteUser(id: string, role: 'estudiante' | 'docente' | 'administrador') {
    switch (role) {
      case 'estudiante':
        return this.estudiantesService.remove(id);
      case 'docente':
        return this.docentesService.remove(id);
      case 'administrador':
        return this.administradoresService.remove(id);
      default:
        throw new BadRequestException(`Rol inválido: ${role}`);
    }
  }

  async findUserById(id: string, role: 'estudiante' | 'docente' | 'administrador') {
    switch (role) {
      case 'estudiante':
        return this.estudiantesService.findById(id);
      case 'docente':
        return this.docentesService.findById(id);
      case 'administrador':
        return this.administradoresService.findById(id);
      default:
        throw new BadRequestException(`Rol inválido: ${role}`);
    }
  }
}

