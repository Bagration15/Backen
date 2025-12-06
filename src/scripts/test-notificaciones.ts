import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificacionesHistorialService } from '../notificaciones/notificaciones-historial.service';
import { TareasNotificacionesService } from '../notificaciones/tareas/tareas-notificaciones.service';

async function testNotificaciones() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const notificacionesService = app.get(NotificacionesService);
  const historialService = app.get(NotificacionesHistorialService);
  const tareasService = app.get(TareasNotificacionesService);

  console.log('🧪 Pruebas de Notificaciones\n');

  // 1. Verificar configuración
  console.log('1. Verificando configuración de email...');
  const configValida = await notificacionesService.verificarConfiguracion();
  console.log(`   ${configValida ? '✅' : '❌'} Configuración: ${configValida ? 'Válida' : 'Inválida'}\n`);

  // 2. Obtener estadísticas
  console.log('2. Obteniendo estadísticas...');
  const estadisticas = await historialService.obtenerEstadisticas();
  console.log('   Estadísticas:', estadisticas);
  console.log('');

  // 3. Obtener historial
  console.log('3. Obteniendo historial de notificaciones...');
  const historial = await historialService.findAll();
  console.log(`   Total de notificaciones: ${historial.length}`);
  if (historial.length > 0) {
    console.log('   Últimas 3 notificaciones:');
    historial.slice(0, 3).forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.nombreDocente} - ${notif.motivo} - ${notif.estado}`);
    });
  }
  console.log('');

  // 4. Ejecutar verificación manual (comentado para no enviar emails reales)
  // console.log('4. Ejecutando verificación de faltas...');
  // await tareasService.verificarFaltasYAsistencias();
  // console.log('   ✅ Verificación completada\n');

  await app.close();
  console.log('✅ Pruebas completadas');
}

testNotificaciones().catch(console.error);

