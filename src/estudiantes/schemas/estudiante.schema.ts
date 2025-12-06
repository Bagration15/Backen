import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EstudianteDocument = Estudiante & Document;

@Schema({ timestamps: true, collection: 'estudiantes' })
export class Estudiante {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  matricula: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  carrera: string;

  @Prop({ required: true })
  semestre: number;

  @Prop({ default: true })
  activo: boolean;

  @Prop()
  telefono?: string;
}

export const EstudianteSchema = SchemaFactory.createForClass(Estudiante);