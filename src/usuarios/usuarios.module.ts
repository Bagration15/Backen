import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { DocentesModule } from '../docentes/docentes.module';
import { EstudiantesModule } from '../estudiantes/estudiantes.module';
import { AdministradoresModule } from '../administradores/administradores.module';

@Module({
  imports: [
    DocentesModule,
    EstudiantesModule,
    AdministradoresModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}

