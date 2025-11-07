import { Schema, Document } from 'mongoose';

export const HorarioSchema = new Schema({
  docenteId: { type: Schema.Types.ObjectId, ref: 'Docente', required: true },
  dia: String,
  horaInicio: String,
  horaFin: String,
});

export interface Horario extends Document {
  docenteId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}
