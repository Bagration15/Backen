import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DocentesService } from '../docentes/docentes.service';
import { AdministradoresService } from '../administradores/administradores.service';
import { EstudiantesService } from '../estudiantes/estudiantes.service';

@Injectable()
export class AuthService {
  constructor(
    private docentesService: DocentesService,
    private administradoresService: AdministradoresService,
    private estudiantesService: EstudiantesService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Buscar primero en administradores (prioridad)
      const administrador = await this.administradoresService.findByEmail(email);
      if (administrador && administrador.password) {
        // Verificar si el administrador está activo
        if (administrador.activo === false) {
          throw new UnauthorizedException('Su cuenta de administrador está desactivada. Contacte al administrador del sistema.');
        }
        const passwordMatch = await bcrypt.compare(password, administrador.password);
        if (passwordMatch) {
          // Convertir documento a objeto de forma segura
          const adminObj = administrador.toObject ? administrador.toObject() : JSON.parse(JSON.stringify(administrador));
          const { password: pwd, ...result } = adminObj;
          // Asegurar que el role esté definido
          if (!result.role) {
            result.role = 'administrador';
          }
          return result;
        }
      }

      // Luego buscar en docentes
      const docente = await this.docentesService.findByEmail(email);
      if (docente) {
        // Verificar si el docente tiene contraseña
        if (!docente.password) {
          throw new UnauthorizedException('El docente no tiene una contraseña configurada. Contacte al administrador para configurar su contraseña.');
        }

        // Verificar si el docente está activo
        if (docente.activo === false) {
          throw new UnauthorizedException('Su cuenta de docente está desactivada. Contacte al administrador del sistema para activar su cuenta.');
        }

        // Comparar contraseña
        const passwordMatch = await bcrypt.compare(password, docente.password);
        if (!passwordMatch) {
          throw new UnauthorizedException('Contraseña incorrecta. Verifique que esté escribiendo la contraseña correcta.');
        }

        // Convertir documento a objeto de forma segura
        const docenteObj = docente.toObject ? docente.toObject() : JSON.parse(JSON.stringify(docente));
        const { password: pwd, ...result } = docenteObj;
        // Asegurar que el role esté definido
        if (!result.role) {
          result.role = 'docente';
        }
        return result;
      }

      return null;
    } catch (error: any) {
      // Si el error ya es UnauthorizedException, relanzarlo
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Para otros errores, lanzar un error genérico
      console.error('Error en validateUser:', error);
      throw new UnauthorizedException('Error al validar las credenciales. Por favor, intente nuevamente.');
    }
  }

  async login(loginDto: { email: string; password: string }) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Validar que el usuario tenga los campos necesarios
      if (!user._id || !user.email || !user.role) {
        console.error('Usuario sin campos requeridos:', user);
        throw new UnauthorizedException('Error en los datos del usuario. Contacte al administrador.');
      }

      const payload = {
        email: user.email,
        sub: user._id.toString(),
        role: user.role,
        nombre: user.nombre || ''
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user._id.toString(),
          nombre: user.nombre || '',
          email: user.email,
          role: user.role,
          departamento: user.departamento || null,
        },
      };
    } catch (error: any) {
      // Si el error ya es UnauthorizedException, relanzarlo
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Para otros errores, loguear y lanzar error genérico
      console.error('Error en login:', error);
      throw new UnauthorizedException('Error al iniciar sesión. Por favor, intente nuevamente.');
    }
  }

  async register(registerDto: any) {
    // Validar que el email no exista en ninguna colección
    await this.validateEmailUnique(registerDto.email);

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.docentesService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...result } = user.toObject();
    return result;
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
}