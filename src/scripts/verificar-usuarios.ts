import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocentesService } from '../docentes/docentes.service';
import { AdministradoresService } from '../administradores/administradores.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const docentesService = app.get(DocentesService);
  const administradoresService = app.get(AdministradoresService);

  const email = 'admin@universidad.edu';

  console.log('\n🔍 Verificando usuarios con email:', email, '\n');

  // Buscar en docentes
  const docente = await docentesService.findByEmail(email);
  if (docente) {
    console.log('❌ Usuario encontrado en DOCENTES:');
    console.log('   ID:', docente._id);
    console.log('   Nombre:', docente.nombre);
    console.log('   Email:', docente.email);
    console.log('   Rol:', docente.role);
    console.log('   ⚠️  Este usuario está bloqueando el acceso del administrador\n');
  } else {
    console.log('✅ No hay usuario en docentes con ese email\n');
  }

  // Buscar en administradores
  const administrador = await administradoresService.findByEmail(email);
  if (administrador) {
    console.log('✅ Usuario encontrado en ADMINISTRADORES:');
    console.log('   ID:', administrador._id);
    console.log('   Nombre:', administrador.nombre);
    console.log('   Email:', administrador.email);
    console.log('   Rol:', administrador.role);
  } else {
    console.log('❌ No hay usuario en administradores con ese email');
  }

  await app.close();
}

bootstrap();

