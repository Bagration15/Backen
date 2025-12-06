import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CursoDocument = Curso & Document;

@Schema({ timestamps: true })
export class Curso {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  codigo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  creditos: number;

  @Prop({ type: Types.ObjectId, ref: 'Docente', required: true })
  docente: Types.ObjectId;

  @Prop({ required: true })
  horario: string;

  @Prop({ required: true })
  aula: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: 30 })
  capacidad: number;
}

export const CursoSchema = SchemaFactory.createForClass(Curso);