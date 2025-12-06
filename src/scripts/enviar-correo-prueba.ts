import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

async function enviarCorreoPrueba() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const notificacionesService = app.get(NotificacionesService);

  // Obtener email destino del argumento o usar el email del admin por defecto
  const emailDestino = process.argv[2] || 'admin@universidad.edu';

  console.log('\n📧 Enviando correo de prueba...\n');
  console.log('📬 Destinatario:', emailDestino);
  console.log('⏳ Enviando...\n');

  try {
    // Verificar configuración primero
    console.log('1️⃣  Verificando configuración SMTP...');
    const configValida = await notificacionesService.verificarConfiguracion();

    if (!configValida) {
      console.error('❌ Error: La configuración SMTP no es válida');
      console.error('   Verifica las variables de entorno en .env');
      console.error('   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
      await app.close();
      process.exit(1);
    }

    console.log('   ✅ Configuración SMTP válida\n');

    // Enviar correo de prueba
    console.log('2️⃣  Enviando correo de prueba...');
    const resultado = await notificacionesService.enviarEmailPrueba(emailDestino);

    if (resultado.success) {
      console.log('   ✅', resultado.message);
      console.log('\n🎉 ¡Correo de prueba enviado exitosamente!');
      console.log(`📬 Revisa la bandeja de entrada de: ${emailDestino}`);
      console.log('   (También revisa la carpeta de spam si no aparece)\n');
    } else {
      console.error('   ❌', resultado.message);
      console.error('\n❌ Error al enviar correo de prueba\n');
      await app.close();
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    await app.close();
    process.exit(1);
  }

  await app.close();
  console.log('✅ Proceso completado\n');
}

enviarCorreoPrueba();

