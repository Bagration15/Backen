import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdministradoresService } from './administradores.service';
import { AdministradoresController } from './administradores.controller';
import { Administrador, AdministradorSchema } from './schemas/administrador.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Administrador.name, schema: AdministradorSchema }]),
  ],
  controllers: [AdministradoresController],
  providers: [AdministradoresService],
  exports: [AdministradoresService],
})
export class AdministradoresModule {}

