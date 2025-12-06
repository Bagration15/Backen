import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AsistenciaDocument = Asistencia & Document;

@Schema({ timestamps: true })
export class Asistencia {

  // 
  @Prop({ type: Types.ObjectId, ref: 'Docente', required: true })
  docente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Curso', required: true })
  curso: Types.ObjectId;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  horaInicio: string;

  @Prop({ required: true })
  horaFin: string;

  @Prop({ default: 'pendiente' })
  estado: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Estudiante' }] })
  estudiantesPresentes: Types.ObjectId[];

  @Prop()
  temaClase: string;

  @Prop({ default: 0 })
  totalEstudiantes: number;
}

export const AsistenciaSchema = SchemaFactory.createForClass(Asistencia);