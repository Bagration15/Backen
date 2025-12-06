import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { DocentesService } from '../docentes/docentes.service';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function diagnosticoLogin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const authService = app.get(AuthService);
    const docentesService = app.get(DocentesService);
    
    console.log('\n=== DIAGNÓSTICO DE LOGIN PARA DOCENTES ===\n');
    
    // Solicitar email del docente
    const email = await question('📧 Ingresa el email del docente: ');
    
    if (!email) {
      console.log('❌ Email no proporcionado');
      await app.close();
      rl.close();
      return;
    }
    
    console.log(`\n🔍 Buscando docente con email: ${email}...\n`);
    
    // Buscar el docente
    const docente = await docentesService.findByEmail(email);
    
    if (!docente) {
      console.log('❌ No se encontró ningún docente con ese email');
      console.log('\n💡 Verifica que:');
      console.log('   1. El email esté escrito correctamente');
      console.log('   2. El docente exista en la base de datos');
      await app.close();
      rl.close();
      return;
    }
    
    console.log('✅ Docente encontrado:');
    console.log(`   Nombre: ${docente.nombre}`);
    console.log(`   Email: ${docente.email}`);
    console.log(`   Departamento: ${docente.departamento}`);
    console.log(`   Activo: ${docente.activo !== false ? 'Sí ✅' : 'No ❌'}`);
    console.log(`   Tiene contraseña: ${docente.password ? 'Sí ✅' : 'No ❌'}`);
    
    if (!docente.password) {
      console.log('\n⚠️  PROBLEMA ENCONTRADO: El docente no tiene contraseña configurada');
      console.log('\n💡 Solución:');
      console.log('   Ejecuta: npm run reset:password');
      console.log('   O actualiza la contraseña desde el panel de administración');
      await app.close();
      rl.close();
      return;
    }
    
    if (docente.activo === false) {
      console.log('\n⚠️  PROBLEMA ENCONTRADO: El docente está desactivado');
      console.log('\n💡 Solución:');
      console.log('   Activa el docente desde el panel de administración');
      await app.close();
      rl.close();
      return;
    }
    
    // Solicitar contraseña
    const password = await question('\n🔐 Ingresa la contraseña del docente: ');
    
    if (!password) {
      console.log('❌ Contraseña no proporcionada');
      await app.close();
      rl.close();
      return;
    }
    
    console.log('\n🔄 Intentando login...\n');
    
    try {
      const result = await authService.login({
        email: email,
        password: password
      });
      
      console.log('✅ LOGIN EXITOSO!');
      console.log(`   Token generado: ${result.access_token.substring(0, 30)}...`);
      console.log(`   Usuario: ${result.user.nombre}`);
      console.log(`   Rol: ${result.user.role}`);
      console.log(`   Email: ${result.user.email}`);
      
    } catch (error: any) {
      console.log('❌ ERROR EN EL LOGIN:');
      console.log(`   Mensaje: ${error.message}`);
      
      if (error.message.includes('Credenciales inválidas')) {
        console.log('\n💡 Posibles causas:');
        console.log('   1. La contraseña es incorrecta');
        console.log('   2. Verifica que estés escribiendo la contraseña correctamente');
        console.log('   3. Si olvidaste la contraseña, resetea desde el panel de administración');
      } else if (error.message.includes('desactivada')) {
        console.log('\n💡 Solución:');
        console.log('   Activa el docente desde el panel de administración');
      } else if (error.message.includes('no tiene una contraseña')) {
        console.log('\n💡 Solución:');
        console.log('   Ejecuta: npm run reset:password');
        console.log('   O actualiza la contraseña desde el panel de administración');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error en el diagnóstico:', error.message);
  } finally {
    await app.close();
    rl.close();
  }
}

diagnosticoLogin().catch(console.error);

