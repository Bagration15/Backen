import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HorarioDocument = Horario & Document;

@Schema({ timestamps: true })
export class Horario {
  @Prop({ type: Types.ObjectId, ref: 'Docente', required: true })
  docente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Curso', required: true })
  curso: Types.ObjectId;

  @Prop({ required: true })
  diaSemana: string;

  @Prop({ required: true })
  horaInicio: string;

  @Prop({ required: true })
  horaFin: string;

  @Prop({ required: true })
  aula: string;

  @Prop({ default: true })
  activo: boolean;
}

export const HorarioSchema = SchemaFactory.createForClass(Horario);