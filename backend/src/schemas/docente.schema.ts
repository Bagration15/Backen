import { Schema, Document } from 'mongoose';

export const DocenteSchema = new Schema({
  cedula: { type: String, required: true },
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  activo: { type: Boolean, default: true },
});

export interface Docente extends Document {
  cedula: string;
  nombre: string;
  email: string;
  activo: boolean;
}
