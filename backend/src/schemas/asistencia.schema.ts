import { Schema, Document } from 'mongoose';

export const AsistenciaSchema = new Schema({
  docenteId: { type: Schema.Types.ObjectId, ref: 'Docente', required: true },
  fecha: { type: Date, required: true },
  asistio: { type: Boolean, required: true },
});

export interface Asistencia extends Document {
  docenteId: string;
  fecha: Date;
  asistio: boolean;
}
