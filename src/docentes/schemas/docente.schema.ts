import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocenteDocument = Docente & Document;

@Schema({ timestamps: true, collection: 'docentes' })
export class Docente {
  @Prop({ required: true, unique: true })
  numeroCedula: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  departamento: string;

  @Prop()
  especialidad: string;

  @Prop({ default: 'docente' })
  role: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop()
  telefono?: string;
}

export const DocenteSchema = SchemaFactory.createForClass(Docente);