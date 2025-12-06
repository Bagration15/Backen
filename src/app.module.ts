import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DocentesModule } from './docentes/docentes.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { CursosModule } from './cursos/cursos.module';
import { HorariosModule } from './horarios/horarios.module';
import { AsistenciaModule } from './asistencia/asistencia.module';
import { AdministradoresModule } from './administradores/administradores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb+srv://Proyecto_DS_II:5tGOjQkDhH67sf9t@cluster0.uux2ndk.mongodb.net/registro-universidad?retryWrites=true&w=majority&appName=Cluster0',
      }),
      inject: [ConfigService],
    }),
    MailModule,
    AuthModule,
    DocentesModule,
    EstudiantesModule,
    AdministradoresModule,
    UsuariosModule,
    CursosModule,     
    HorariosModule,
    AsistenciaModule,
    NotificacionesModule,
  ],
})
export class AppModule {}