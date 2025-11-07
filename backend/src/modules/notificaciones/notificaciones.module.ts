// src/modules/notificaciones/notificaciones.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificacionesController } from '../../controllers/notificaciones.controller';
import { NotificacionesService } from '../../services/notificaciones.service';
import { Notificacion, NotificacionSchema } from '../../schemas/notificacion.schema';
import { DocentesService } from '../../services/docentes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notificacion.name, schema: NotificacionSchema },
    ]),
  ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, DocentesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}