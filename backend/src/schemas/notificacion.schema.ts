import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notificacion extends Document {
  @Prop({ type: Object })
  docente: {
    id: string | null;
    nombre: string;
  };

  @Prop()
  mensaje: string;

  @Prop()
  fecha: Date;
}

export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);

