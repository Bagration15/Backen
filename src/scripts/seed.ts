import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocentesService } from '../docentes/docentes.service';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const docentesService = app.get(DocentesService);

  const testUser = {
    numeroCedula: '1234567890',
    nombre: 'Admin Test',
    email: 'admin@universidad.edu',
    password: 'admin123',
    departamento: 'Sistemas',
    especialidad: 'Desarrollo de Software',
    role: 'docente',
    activo: true,
    telefono: '1234567890'
  };

  try {
    // Verificar si el usuario ya existe
    const existingUser = await docentesService.findByEmail(testUser.email);

    if (existingUser) {
      console.log('⚠️  El usuario de prueba ya existe:', testUser.email);
      console.log('   Puedes usar estas credenciales para iniciar sesión:');
      console.log('   Email:', testUser.email);
      console.log('   Password:', testUser.password);
    } else {
      // Crear el usuario (DocentesService.create() ya hashea la contraseña)
      const user = await docentesService.create({
        ...testUser,
        password: testUser.password, // Pasar contraseña sin hashear, el servicio la hasheará
      });

      console.log('✅ Usuario de prueba creado exitosamente!');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Password:', testUser.password);
      console.log('👤 Nombre:', user.nombre);
      console.log('🏢 Departamento:', user.departamento);
    }
  } catch (error) {
    console.error('❌ Error al crear usuario de prueba:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();

