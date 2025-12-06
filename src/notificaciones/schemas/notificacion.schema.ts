import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificacionDocument = Notificacion & Document;

@Schema({ timestamps: true, collection: 'notificaciones' })
export class Notificacion {
  @Prop({ type: Types.ObjectId, ref: 'Docente', required: true })
  docente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Curso' })
  curso: Types.ObjectId;

  @Prop({ required: true })
  emailDestinatario: string;

  @Prop({ required: true })
  nombreDocente: string;

  @Prop()
  nombreCurso: string;

  @Prop({ required: true })
  fechaClase: Date;

  @Prop({ required: true, enum: ['falta', 'sin_registro'] })
  motivo: string;

  @Prop({ required: true, enum: ['enviado', 'error'] })
  estado: string;

  @Prop()
  mensajeError?: string;

  @Prop({ default: false })
  notificacionAdministrador: boolean;

  @Prop()
  emailAdministrador?: string;

  @Prop({ default: 'notificacion' })
  tipoRegistro: 'notificacion' | 'asistencia_registrada'; // Tipo de registro para dashboard
}

export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);

