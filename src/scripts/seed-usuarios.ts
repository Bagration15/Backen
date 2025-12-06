import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  const usuariosPrueba = [
    {
      nombre: 'Admin Principal',
      email: 'admin@universidad.edu',
      password: 'admin123',
      role: 'administrador' as const,
      cargo: 'Director General',
      telefono: '1234567890'
    },
    {
      nombre: 'Profesor Juan Pérez',
      email: 'juan.perez@universidad.edu',
      password: 'docente123',
      role: 'docente' as const,
      departamento: 'Sistemas',
      especialidad: 'Desarrollo de Software',
      telefono: '0987654321'
    },
    {
      nombre: 'María García',
      email: 'maria.garcia@universidad.edu',
      password: 'estudiante123',
      role: 'estudiante' as const,
      matricula: '2024001',
      carrera: 'Ingeniería en Sistemas',
      semestre: 5,
      telefono: '1122334455'
    }
  ];

  console.log('\n🌱 Creando usuarios de prueba...\n');

  for (const usuario of usuariosPrueba) {
    try {
      const user = await usuariosService.createUser(usuario);
      console.log(`✅ Usuario creado: ${usuario.nombre}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🔑 Password: ${usuario.password}`);
      console.log(`   👤 Rol: ${usuario.role}`);
      console.log(`   📍 Colección: ${usuario.role === 'estudiante' ? 'estudiantes' : usuario.role === 'docente' ? 'docentes' : 'administradores'}\n`);
    } catch (error) {
      if (error.message.includes('ya está registrado')) {
        console.log(`⚠️  Usuario ya existe: ${usuario.email}`);
        console.log(`   Puedes usar estas credenciales para iniciar sesión:\n`);
      } else {
        console.error(`❌ Error al crear ${usuario.nombre}:`, error.message);
      }
    }
  }

  console.log('\n📊 Resumen de usuarios creados:');
  console.log('   - Base de datos: registro-universidad');
  console.log('   - Colecciones: estudiantes, docentes, administradores\n');

  await app.close();
}

bootstrap();

