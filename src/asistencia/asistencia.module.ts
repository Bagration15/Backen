import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaController } from './asistencia.controller';
import { Asistencia, AsistenciaSchema } from './schemas/asistencia.schema';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asistencia.name, schema: AsistenciaSchema }]),
    forwardRef(() => NotificacionesModule),
  ],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule { }