import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { DocentesService } from '../docentes/docentes.service';

async function testLoginDocente() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const authService = app.get(AuthService);
  const docentesService = app.get(DocentesService);

  console.log('🧪 Prueba de Login de Docente\n');

  // Obtener todos los docentes
  const docentes = await docentesService.findAll();
  console.log(`📋 Total de docentes encontrados: ${docentes.length}\n`);

  if (docentes.length === 0) {
    console.log('❌ No hay docentes registrados en la base de datos');
    console.log('💡 Ejecuta: npm run seed:usuarios para crear docentes de prueba\n');
    await app.close();
    return;
  }

  // Mostrar información de cada docente
  for (const docente of docentes) {
    console.log(`\n👤 Docente: ${docente.nombre}`);
    console.log(`   Email: ${docente.email}`);
    console.log(`   Rol: ${docente.role || 'NO DEFINIDO'}`);
    console.log(`   Activo: ${docente.activo !== false ? 'Sí' : 'No'}`);
    console.log(`   Departamento: ${docente.departamento || 'N/A'}`);
    
    // Intentar login con contraseña de prueba
    const testPasswords = ['password123', 'docente123', '123456', docente.email.split('@')[0]];
    
    console.log(`\n   🔐 Probando login...`);
    let loginExitoso = false;
    
    for (const testPassword of testPasswords) {
      try {
        const result = await authService.login({
          email: docente.email,
          password: testPassword
        });
        console.log(`   ✅ Login exitoso con contraseña: "${testPassword}"`);
        console.log(`   Token generado: ${result.access_token.substring(0, 20)}...`);
        loginExitoso = true;
        break;
      } catch (error: any) {
        // No mostrar errores de contraseña incorrecta, solo otros errores
        if (error.message && !error.message.includes('Credenciales inválidas')) {
          console.log(`   ⚠️  Error: ${error.message}`);
        }
      }
    }
    
    if (!loginExitoso) {
      console.log(`   ❌ No se pudo hacer login con ninguna contraseña de prueba`);
      console.log(`   💡 Verifica que el docente tenga una contraseña válida`);
    }
  }

  await app.close();
  console.log('\n✅ Prueba completada');
}

testLoginDocente().catch(console.error);

