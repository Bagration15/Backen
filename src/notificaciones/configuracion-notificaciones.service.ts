import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfiguracionNotificacion, ConfiguracionNotificacionDocument } from './schemas/configuracion-notificacion.schema';

@Injectable()
export class ConfiguracionNotificacionesService {
  private readonly logger = new Logger(ConfiguracionNotificacionesService.name);

  constructor(
    @InjectModel(ConfiguracionNotificacion.name)
    private configModel: Model<ConfiguracionNotificacionDocument>,
  ) {}

  // Obtener la configuración activa
  async obtenerConfiguracionActiva(): Promise<ConfiguracionNotificacionDocument | null> {
    try {
      let config = await this.configModel.findOne({ activo: true }).exec();
      
      // Si no existe configuración activa, crear una por defecto
      if (!config) {
        this.logger.log('No se encontró configuración activa, creando configuración por defecto');
        config = await this.crearConfiguracionPorDefecto();
      }
      
      return config;
    } catch (error) {
      this.logger.error('Error al obtener configuración activa:', error);
      // Retornar configuración por defecto en memoria si falla
      return this.getConfiguracionPorDefecto();
    }
  }

  // Crear configuración por defecto
  async crearConfiguracionPorDefecto(): Promise<ConfiguracionNotificacionDocument> {
    const configPorDefecto = {
      activo: true,
      horarioVerificacionPrincipal: '20:00',
      horarioVerificacionTemprana: '09:00',
      destinatariosAdicionales: [],
      plantillaDocente: this.getPlantillaDocentePorDefecto(),
      plantillaAdministrador: this.getPlantillaAdministradorPorDefecto(),
      asuntoDocente: 'Notificación: {{motivoTexto}}',
      asuntoAdministrador: 'Alerta del Sistema - Incidencia Detectada',
      enviarADocentes: true,
      enviarAAdministradores: true,
      enviarADestinatariosAdicionales: true,
      descripcion: 'Configuración por defecto del sistema',
    };

    // Desactivar todas las configuraciones existentes
    await this.configModel.updateMany({}, { activo: false }).exec();

    const nuevaConfig = new this.configModel(configPorDefecto);
    return nuevaConfig.save();
  }

  // Obtener configuración por ID
  async obtenerPorId(id: string): Promise<ConfiguracionNotificacionDocument | null> {
    return this.configModel.findById(id).exec();
  }

  // Obtener todas las configuraciones
  async obtenerTodas(): Promise<ConfiguracionNotificacionDocument[]> {
    return this.configModel.find().sort({ createdAt: -1 }).exec();
  }

  // Crear nueva configuración
  async crear(data: Partial<ConfiguracionNotificacion>): Promise<ConfiguracionNotificacionDocument> {
    // Si se marca como activa, desactivar las demás
    if (data.activo !== false) {
      await this.configModel.updateMany({}, { activo: false }).exec();
      data.activo = true;
    }

    const nuevaConfig = new this.configModel(data);
    return nuevaConfig.save();
  }

  // Actualizar configuración
  async actualizar(
    id: string,
    data: Partial<ConfiguracionNotificacion>
  ): Promise<ConfiguracionNotificacionDocument | null> {
    // Si se marca como activa, desactivar las demás
    if (data.activo === true) {
      await this.configModel.updateMany({ _id: { $ne: id } }, { activo: false }).exec();
    }

    return this.configModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  // Activar una configuración específica
  async activar(id: string): Promise<ConfiguracionNotificacionDocument | null> {
    // Desactivar todas
    await this.configModel.updateMany({}, { activo: false }).exec();
    
    // Activar la seleccionada
    return this.configModel
      .findByIdAndUpdate(id, { activo: true }, { new: true })
      .exec();
  }

  // Eliminar configuración
  async eliminar(id: string): Promise<boolean> {
    const resultado = await this.configModel.findByIdAndDelete(id).exec();
    return !!resultado;
  }

  // Plantillas por defecto
  private getPlantillaDocentePorDefecto(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #d32f2f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Notificación del Sistema de Gestión Universitaria</h2>
    </div>
    <div class="content">
      <p>Estimado/a <strong>{{nombreDocente}}</strong>,</p>
      <p>Le informamos que usted {{motivoTexto}}:</p>
      <div class="info-box">
        <p><strong>Curso:</strong> {{nombreCurso}}</p>
        <p><strong>Fecha:</strong> {{fecha}}</p>
      </div>
      <p>Por favor, póngase en contacto con la administración si tiene alguna consulta o necesita justificar su ausencia.</p>
      <p>Atentamente,<br>Sistema de Gestión Universitaria</p>
    </div>
    <div class="footer">
      <p>Este es un mensaje automático. Por favor, no responda a este correo.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getPlantillaAdministradorPorDefecto(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .alert-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Alerta del Sistema</h2>
    </div>
    <div class="content">
      <p>Se ha detectado una incidencia:</p>
      <div class="alert-box">
        <p><strong>Docente:</strong> {{nombreDocente}}</p>
        <p><strong>Curso:</strong> {{nombreCurso}}</p>
        <p><strong>Fecha:</strong> {{fecha}}</p>
        <p><strong>Motivo:</strong> {{motivoTexto}}</p>
      </div>
      <p>Por favor, revise la situación y tome las medidas correspondientes.</p>
    </div>
    <div class="footer">
      <p>Este es un mensaje automático del Sistema de Gestión Universitaria.</p>
    </div>
  </div>
</body>
</html>`;
  }

  // Retornar configuración por defecto en memoria (fallback)
  private getConfiguracionPorDefecto(): ConfiguracionNotificacionDocument {
    return {
      activo: true,
      horarioVerificacionPrincipal: '20:00',
      horarioVerificacionTemprana: '09:00',
      destinatariosAdicionales: [],
      plantillaDocente: this.getPlantillaDocentePorDefecto(),
      plantillaAdministrador: this.getPlantillaAdministradorPorDefecto(),
      asuntoDocente: 'Notificación: {{motivoTexto}}',
      asuntoAdministrador: 'Alerta del Sistema - Incidencia Detectada',
      enviarADocentes: true,
      enviarAAdministradores: true,
      enviarADestinatariosAdicionales: true,
    } as ConfiguracionNotificacionDocument;
  }

  // Reemplazar variables en plantilla
  reemplazarVariables(plantilla: string, variables: Record<string, string>): string {
    let resultado = plantilla;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      resultado = resultado.replace(regex, value);
    }
    return resultado;
  }
}

