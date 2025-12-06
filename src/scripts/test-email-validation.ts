import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsuariosService } from '../usuarios/usuarios.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usuariosService = app.get(UsuariosService);

  console.log('\n🧪 Probando validación de emails duplicados...\n');

  // Intentar crear un usuario con un email que ya existe
  const emailExistente = 'admin@universidad.edu';

  try {
    console.log(`Intentando crear usuario con email: ${emailExistente}`);
    await usuariosService.createUser({
      nombre: 'Usuario Test',
      email: emailExistente,
      password: 'test123',
      role: 'docente',
      departamento: 'Test'
    });
    console.log('❌ ERROR: Se permitió crear un usuario con email duplicado');
  } catch (error: any) {
    if (error.message.includes('ya está registrado')) {
      console.log('✅ Validación funcionando correctamente!');
      console.log(`   Mensaje de error: ${error.message}`);
    } else {
      console.log('❌ Error inesperado:', error.message);
    }
  }

  // Intentar crear un usuario con un email nuevo
  const emailNuevo = `test${Date.now()}@universidad.edu`;
  try {
    console.log(`\nIntentando crear usuario con email nuevo: ${emailNuevo}`);
    const usuario = await usuariosService.createUser({
      nombre: 'Usuario Test Nuevo',
      email: emailNuevo,
      password: 'test123',
      role: 'docente',
      departamento: 'Test'
    });
    console.log('✅ Usuario creado exitosamente con email nuevo');
    console.log(`   ID: ${usuario._id}`);
    console.log(`   Email: ${usuario.email}`);
  } catch (error: any) {
    console.log('❌ Error al crear usuario:', error.message);
  }

  await app.close();
}

bootstrap();

