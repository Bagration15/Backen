import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocentesModule } from './modules/docentes/docentes.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/docentesdb'),
    DocentesModule,
    NotificacionesModule, // 👈 Asegúrate de tener esto
  ],
})
export class AppModule {}
