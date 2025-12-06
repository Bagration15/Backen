import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdministradorDocument = Administrador & Document;

@Schema({ timestamps: true, collection: 'administradores' })
export class Administrador {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'administrador' })
  role: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop()
  telefono?: string;

  @Prop()
  cargo?: string;
}

export const AdministradorSchema = SchemaFactory.createForClass(Administrador);

