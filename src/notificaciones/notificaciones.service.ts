import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Notificacion, NotificacionDocument } from './schemas/notificacion.schema';
import { NotificacionesHistorialService } from './notificaciones-historial.service';
import { ConfiguracionNotificacionesService } from './configuracion-notificaciones.service';
import { Docente, DocenteDocument } from '../docentes/schemas/docente.schema';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => NotificacionesHistorialService))
    private historialService: NotificacionesHistorialService,
    @Inject(forwardRef(() => ConfiguracionNotificacionesService))
    private configuracionService: ConfiguracionNotificacionesService,
    @InjectModel(Docente.name) private docenteModel: Model<DocenteDocument>,
  ) {
    // Configurar el transporter de nodemailer
    // Por defecto, usar configuración de Gmail o SMTP genérico
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get('SMTP_USER') || '',
        pass: this.configService.get('SMTP_PASS') || '',
      },
      tls: {
        // No rechazar certificados autofirmados (solo para desarrollo)
        rejectUnauthorized: false,
      },
    });
  }

  async enviarNotificacionFalta(
    emailDocente: string,
    nombreDocente: string,
    nombreCurso: string,
    fecha: Date,
    motivo: 'falta' | 'sin_registro',
    docenteId?: string,
    cursoId?: string
  ): Promise<void> {
    // Obtener configuración activa
    const config = await this.configuracionService.obtenerConfiguracionActiva();
    
    // Verificar si está habilitado el envío a docentes
    if (config && !config.enviarADocentes) {
      this.logger.log('Envío a docentes deshabilitado en configuración');
      return;
    }

    const motivoTexto = motivo === 'falta'
      ? 'no asistió a su clase programada'
      : 'no registró la asistencia de su clase';
    
    const motivoTextoCorto = motivo === 'falta'
      ? 'Falta a clase'
      : 'Asistencia no registrada';

    // Usar plantilla de configuración o plantilla por defecto
    let plantilla = config?.plantillaDocente || this.getPlantillaDocentePorDefecto();
    let asunto = config?.asuntoDocente || `Notificación: ${motivoTextoCorto}`;

    // Reemplazar variables en plantilla y asunto
    const variables = {
      nombreDocente,
      nombreCurso,
      fecha: fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      motivoTexto,
      motivoTextoCorto,
    };

    const html = this.configuracionService.reemplazarVariables(plantilla, variables);
    asunto = this.configuracionService.reemplazarVariables(asunto, variables);

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@universidad.edu',
        to: emailDocente,
        subject: asunto,
        html: html,
      });
      this.logger.log(`Notificación enviada a ${emailDocente} por ${motivo}`);

      // Registrar en el historial
      await this.historialService.crearRegistro({
        docente: docenteId || '',
        curso: cursoId || undefined, // Usar undefined en lugar de cadena vacía
        emailDestinatario: emailDocente,
        nombreDocente: nombreDocente,
        nombreCurso: nombreCurso,
        fechaClase: fecha,
        motivo: motivo,
        estado: 'enviado',
        notificacionAdministrador: false,
      });
    } catch (error) {
      this.logger.error(`Error al enviar notificación a ${emailDocente}:`, error);

      // Registrar error en el historial
      await this.historialService.crearRegistro({
        docente: docenteId || '',
        curso: cursoId || undefined, // Usar undefined en lugar de cadena vacía
        emailDestinatario: emailDocente,
        nombreDocente: nombreDocente,
        nombreCurso: nombreCurso,
        fechaClase: fecha,
        motivo: motivo,
        estado: 'error',
        mensajeError: error.message,
        notificacionAdministrador: false,
      });

      throw error;
    }
  }

  async enviarNotificacionAdministrador(
    emailAdmin: string,
    nombreDocente: string,
    nombreCurso: string,
    fecha: Date,
    motivo: 'falta' | 'sin_registro'
  ): Promise<void> {
    // Obtener configuración activa
    const config = await this.configuracionService.obtenerConfiguracionActiva();
    
    // Verificar si está habilitado el envío a administradores
    if (config && !config.enviarAAdministradores) {
      this.logger.log('Envío a administradores deshabilitado en configuración');
      return;
    }

    const motivoTexto = motivo === 'falta'
      ? 'no asistió a su clase programada'
      : 'no registró la asistencia de su clase';
    
    const motivoTextoCorto = motivo === 'falta'
      ? 'Falta a clase'
      : 'Asistencia no registrada';

    // Usar plantilla de configuración o plantilla por defecto
    let plantilla = config?.plantillaAdministrador || this.getPlantillaAdministradorPorDefecto();
    let asunto = config?.asuntoAdministrador || `Alerta del Sistema - Incidencia Detectada`;

    // Reemplazar variables en plantilla y asunto
    const variables = {
      nombreDocente,
      nombreCurso,
      fecha: fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      motivoTexto,
      motivoTextoCorto,
    };

    const html = this.configuracionService.reemplazarVariables(plantilla, variables);
    asunto = this.configuracionService.reemplazarVariables(asunto, variables);

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@universidad.edu',
        to: emailAdmin,
        subject: asunto,
        html: html,
      });
      this.logger.log(`Notificación de alerta enviada a administrador ${emailAdmin}`);

      // Registrar en el historial
      await this.historialService.crearRegistro({
        docente: '',
        emailDestinatario: emailAdmin,
        nombreDocente: nombreDocente,
        nombreCurso: nombreCurso,
        fechaClase: fecha,
        motivo: motivo,
        estado: 'enviado',
        notificacionAdministrador: true,
        emailAdministrador: emailAdmin,
      });
    } catch (error) {
      this.logger.error(`Error al enviar notificación a administrador ${emailAdmin}:`, error);

      // Registrar error en el historial
      await this.historialService.crearRegistro({
        docente: '',
        emailDestinatario: emailAdmin,
        nombreDocente: nombreDocente,
        nombreCurso: nombreCurso,
        fechaClase: fecha,
        motivo: motivo,
        estado: 'error',
        mensajeError: error.message,
        notificacionAdministrador: true,
        emailAdministrador: emailAdmin,
      });

      throw error;
    }
  }

  // Método para verificar la configuración del email
  async verificarConfiguracion(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Configuración de email verificada correctamente');
      return true;
    } catch (error) {
      this.logger.error('Error en la configuración de email:', error);
      return false;
    }
  }

  // Método específico para enviar correo de prueba (Entrega 1)
  async enviarEmailPrueba(emailDestino: string): Promise<{ success: boolean; message: string }> {
    try {
      const asunto = '✅ Prueba de Correo - Sistema de Gestión Universitaria';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f4f4f4;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background-color: white; 
              padding: 30px; 
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 25px; 
              text-align: center; 
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 20px 0;
            }
            .success-icon {
              text-align: center;
              font-size: 48px;
              margin: 20px 0;
            }
            .info-box {
              background-color: #e3f2fd;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer { 
              padding: 20px 0; 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
              border-top: 1px solid #eee;
              margin-top: 20px;
            }
            .config-details {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              font-family: monospace;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Correo de Prueba Exitoso</h1>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <p>Hola,</p>
              <p>Este es un <strong>correo de prueba</strong> del <strong>Sistema de Gestión Universitaria</strong>.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📧 Configuración SMTP Verificada</h3>
                <p>Si estás recibiendo este mensaje, significa que:</p>
                <ul>
                  <li>✅ La configuración del servidor SMTP es correcta</li>
                  <li>✅ Las credenciales están funcionando</li>
                  <li>✅ El sistema puede enviar correos electrónicos</li>
                  <li>✅ La conexión con el proveedor de correo está establecida</li>
                </ul>
              </div>

              <div class="config-details">
                <strong>Detalles de la prueba:</strong><br>
                Servidor: ${this.configService.get('SMTP_HOST') || 'smtp.gmail.com'}<br>
                Puerto: ${this.configService.get('SMTP_PORT') || '587'}<br>
                Fecha: ${new Date().toLocaleString('es-ES')}<br>
                Destinatario: ${emailDestino}
              </div>

              <p>Este correo fue generado automáticamente para verificar la funcionalidad del sistema de notificaciones por email.</p>
              <p>No es necesario responder a este mensaje.</p>
            </div>
            <div class="footer">
              <p>Este es un correo automático del <strong>Sistema de Gestión Universitaria</strong>.</p>
              <p>Por favor, no responda a este correo.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textoPlano = `
✅ Correo de Prueba Exitoso

Hola,

Este es un correo de prueba del Sistema de Gestión Universitaria.

Si estás recibiendo este mensaje, significa que la configuración del servidor SMTP es correcta y el sistema puede enviar correos electrónicos.

Detalles de la prueba:
- Servidor: ${this.configService.get('SMTP_HOST') || 'smtp.gmail.com'}
- Puerto: ${this.configService.get('SMTP_PORT') || '587'}
- Fecha: ${new Date().toLocaleString('es-ES')}
- Destinatario: ${emailDestino}

Este correo fue generado automáticamente para verificar la funcionalidad del sistema de notificaciones por email.

---
Sistema de Gestión Universitaria
Este es un correo automático. Por favor, no responda.
      `;

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER') || 'noreply@universidad.edu',
        to: emailDestino,
        subject: asunto,
        text: textoPlano,
        html: html,
      });

      this.logger.log(`Correo de prueba enviado exitosamente a ${emailDestino}`);

      return {
        success: true,
        message: `Correo de prueba enviado exitosamente a ${emailDestino}`,
      };
    } catch (error) {
      this.logger.error(`Error al enviar correo de prueba a ${emailDestino}:`, error);

      return {
        success: false,
        message: `Error al enviar correo de prueba: ${error.message}`,
      };
    }
  }

  // Método para enviar notificación manual desde admin
  async enviarNotificacionManual(
    docenteId: string,
    motivo: 'falta' | 'sin_registro',
    mensajePersonalizado?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Obtener información del docente
      const docente = await this.docenteModel.findById(docenteId).exec();

      if (!docente) {
        throw new Error(`Docente con ID ${docenteId} no encontrado`);
      }

      // Obtener el curso más reciente del docente o usar uno genérico
      const fecha = new Date();
      const nombreCurso = 'Clase del docente'; // Se puede mejorar obteniendo el curso real

      // Enviar notificación al docente
      await this.enviarNotificacionFalta(
        docente.email,
        docente.nombre,
        nombreCurso,
        fecha,
        motivo,
        docente._id.toString(),
        undefined // cursoId
      );

      this.logger.log(`Notificación manual enviada a ${docente.email}`);

      return {
        success: true,
        message: `Notificación enviada exitosamente a ${docente.email}`,
      };
    } catch (error) {
      this.logger.error(`Error al enviar notificación manual:`, error);

      return {
        success: false,
        message: `Error al enviar notificación manual: ${error.message}`,
      };
    }
  }

  // Plantillas por defecto (fallback)
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
}

