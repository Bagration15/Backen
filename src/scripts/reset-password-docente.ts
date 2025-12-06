import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocentesService } from '../docentes/docentes.service';
import * as bcrypt from 'bcryptjs';

async function resetPasswordDocente() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const docentesService = app.get(DocentesService);

  try {
    console.log('🔐 Resetear Contraseña de Docente\n');

    // Obtener argumentos de la línea de comandos
    const args = process.argv.slice(2);
    const email = args[0];
    const nuevaPassword = args[1] || 'docente123'; // Contraseña por defecto

    if (!email) {
      console.log('❌ Uso: npm run reset:password <email> [nueva-contraseña]');
      console.log('\n📋 Ejemplo:');
      console.log('   npm run reset:password juan.perez@universidad.edu docente123');
      console.log('\n📋 Docentes disponibles:\n');
      
      const docentes = await docentesService.findAll();
      docentes.forEach((docente, index) => {
        console.log(`${index + 1}. ${docente.nombre} (${docente.email})`);
      });
      
      await app.close();
      return;
    }

    // Buscar docente
    const docente = await docentesService.findByEmail(email);
    if (!docente) {
      console.log(`❌ No se encontró un docente con el email: ${email}`);
      await app.close();
      return;
    }

    console.log(`\n👤 Docente encontrado: ${docente.nombre}`);
    console.log(`📧 Email: ${email}`);

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // Actualizar contraseña directamente en la base de datos
    const docenteModel = (docentesService as any).docenteModel;
    await docenteModel.updateOne(
      { _id: docente._id },
      { $set: { password: hashedPassword, activo: true } }
    );

    console.log(`\n✅ Contraseña actualizada exitosamente!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Nueva contraseña: ${nuevaPassword}`);
    console.log(`\n💡 Ahora puedes iniciar sesión con estas credenciales`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.close();
  }
}

resetPasswordDocente().catch(console.error);

