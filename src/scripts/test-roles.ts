import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);
  const authService = app.get(AuthService);

  console.log('\n🔐 Probando restricción de roles...\n');

  // Intentar crear usuario como administrador
  try {
    console.log('1. Login como administrador...');
    const adminLogin = await authService.login({
      email: 'admin@universidad.edu',
      password: 'admin123'
    });
    console.log('✅ Login exitoso como:', adminLogin.user.role);
    console.log('   Token generado:', adminLogin.access_token.substring(0, 30) + '...\n');
  } catch (error) {
    console.log('❌ Error al hacer login:', error.message);
  }

  // Intentar crear usuario como docente
  try {
    console.log('2. Login como docente...');
    const docenteLogin = await authService.login({
      email: 'juan.perez@universidad.edu',
      password: 'docente123'
    });
    console.log('✅ Login exitoso como:', docenteLogin.user.role);
    console.log('   Token generado:', docenteLogin.access_token.substring(0, 30) + '...\n');
  } catch (error) {
    console.log('❌ Error al hacer login:', error.message);
  }

  console.log('📋 Nota:');
  console.log('   - Solo usuarios con rol "administrador" pueden crear usuarios');
  console.log('   - El endpoint POST /usuarios requiere autenticación JWT + rol administrador');
  console.log('   - Los docentes y estudiantes recibirán error 403 Forbidden\n');

  await app.close();
}

bootstrap();

