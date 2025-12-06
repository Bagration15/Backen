import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfiguracionNotificacionDocument = ConfiguracionNotificacion & Document;

@Schema({ timestamps: true, collection: 'configuracion_notificaciones' })
export class ConfiguracionNotificacion {
  @Prop({ default: true })
  activo: boolean;

  // Horarios de verificación (formato HH:MM)
  @Prop({ default: '20:00', required: true })
  horarioVerificacionPrincipal: string; // Hora de verificación principal (8PM por defecto)

  @Prop({ default: '09:00', required: true })
  horarioVerificacionTemprana: string; // Hora de verificación temprana (9AM por defecto)

  // Destinatarios adicionales (emails externos)
  @Prop({ type: [String], default: [] })
  destinatariosAdicionales: string[]; // Emails adicionales para notificaciones de administradores

  // Plantilla HTML para notificación a docente
  @Prop({ required: true })
  plantillaDocente: string;

  // Plantilla HTML para notificación a administrador
  @Prop({ required: true })
  plantillaAdministrador: string;

  // Asunto del correo para docente
  @Prop({ default: 'Notificación del Sistema de Gestión Universitaria', required: true })
  asuntoDocente: string;

  // Asunto del correo para administrador
  @Prop({ default: 'Alerta del Sistema - Incidencia Detectada', required: true })
  asuntoAdministrador: string;

  // Configuración de envío
  @Prop({ default: true })
  enviarADocentes: boolean;

  @Prop({ default: true })
  enviarAAdministradores: boolean;

  @Prop({ default: true })
  enviarADestinatariosAdicionales: boolean;

  // Notas/descripción de la configuración
  @Prop()
  descripcion?: string;
}

export const ConfiguracionNotificacionSchema = SchemaFactory.createForClass(ConfiguracionNotificacion);

