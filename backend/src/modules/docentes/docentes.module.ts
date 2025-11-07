import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocenteSchema } from '../../schemas/docente.schema';
import { DocentesController } from './docentes.controller';
import { DocentesService } from './docentes.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Docente', schema: DocenteSchema }])],
  controllers: [DocentesController],
  providers: [DocentesService],
})
export class DocentesModule {}
