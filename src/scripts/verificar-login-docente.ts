import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { DocentesService } from '../docentes/docentes.service';

async function verificarLoginDocente() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const authService = app.get(AuthService);
    const docentesService = app.get(DocentesService);
    
    console.log('\n=== VERIFICACIÓN DE LOGIN PARA DOCENTES ===\n');
    
    // Obtener todos los docentes
    const docentes = await docentesService.findAll();
    
    if (docentes.length === 0) {
      console.log('⚠️  No hay docentes en la base de datos');
      await app.close();
      return;
    }
    
    console.log(`📋 Se encontraron ${docentes.length} docente(s):\n`);
    
    for (const docente of docentes) {
      console.log(`👤 ${docente.nombre}`);
      console.log(`   Email: ${docente.email}`);
      console.log(`   Activo: ${docente.activo !== false ? 'Sí ✅' : 'No ❌'}`);
      
      // Verificar si tiene contraseña
      const docenteConPassword = await docentesService.findByEmail(docente.email);
      
      if (!docenteConPassword?.password) {
        console.log(`   ⚠️  PROBLEMA: No tiene contraseña configurada`);
        console.log(`   💡 Solución: Ejecuta "npm run reset:password" o actualiza desde el panel`);
      } else {
        console.log(`   ✅ Tiene contraseña configurada`);
      }
      
      console.log('');
    }
    
    console.log('\n💡 Para probar el login de un docente específico:');
    console.log('   Ejecuta: npm run diagnostico:login');
    console.log('   Ingresa el email y contraseña del docente\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.close();
  }
}

verificarLoginDocente().catch(console.error);

