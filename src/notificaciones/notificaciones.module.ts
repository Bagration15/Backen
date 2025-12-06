import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { NotificacionesService } from './notificaciones.service';
import { TareasNotificacionesService } from './tareas/tareas-notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesHistorialService } from './notificaciones-historial.service';
import { ConfiguracionNotificacionesService } from './configuracion-notificaciones.service';
import { Notificacion, NotificacionSchema } from './schemas/notificacion.schema';
import { ConfiguracionNotificacion, ConfiguracionNotificacionSchema } from './schemas/configuracion-notificacion.schema';
import { Horario, HorarioSchema } from '../horarios/schemas/horario.schema';
import { Asistencia, AsistenciaSchema } from '../asistencia/schemas/asistencia.schema';
import { Docente, DocenteSchema } from '../docentes/schemas/docente.schema';
import { Administrador, AdministradorSchema } from '../administradores/schemas/administrador.schema';
import { Curso, CursoSchema } from '../cursos/schemas/curso.schema';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Horario.name, schema: HorarioSchema },
      { name: Asistencia.name, schema: AsistenciaSchema },
      { name: Docente.name, schema: DocenteSchema },
      { name: Administrador.name, schema: AdministradorSchema },
      { name: Notificacion.name, schema: NotificacionSchema },
      { name: Curso.name, schema: CursoSchema },
      { name: ConfiguracionNotificacion.name, schema: ConfiguracionNotificacionSchema },
    ]),
  ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, TareasNotificacionesService, NotificacionesHistorialService, ConfiguracionNotificacionesService],
  exports: [NotificacionesService, NotificacionesHistorialService, ConfiguracionNotificacionesService],
})
export class NotificacionesModule { }

