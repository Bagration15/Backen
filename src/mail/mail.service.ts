import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  // Enviar correo de prueba
  async sendTestEmail(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '✅ Prueba de Correo - Sistema de Docentes',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px;">
              <h1 style="color: #4CAF50;">¡Correo de Prueba Exitoso!</h1>
              <p>Hola,</p>
              <p>Este es un correo de prueba del <strong>Sistema de Registro de Docentes</strong>.</p>
              <p>Si estás recibiendo este mensaje, significa que la configuración de correo está funcionando correctamente.</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no responder.
              </p>
            </div>
          </div>
        `,
      });
      return { success: true, message: 'Correo enviado exitosamente' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error al enviar correo', 
        error: error.message 
      };
    }
  }

  // Enviar correo de bienvenida a docente registrado
  async sendWelcomeEmail(docenteEmail: string, docenteNombre: string) {
    try {
      await this.mailerService.sendMail({
        to: docenteEmail,
        subject: '🎓 Bienvenido al Sistema de Docentes',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px;">
              <h1 style="color: #2196F3;">¡Bienvenido/a ${docenteNombre}!</h1>
              <p>Tu registro como docente ha sido exitoso.</p>
              <p>Ahora formas parte de nuestro sistema de gestión académica.</p>
              <div style="background-color: #E3F2FD; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Datos de tu cuenta:</h3>
                <p><strong>Correo:</strong> ${docenteEmail}</p>
                <p><strong>Nombre:</strong> ${docenteNombre}</p>
              </div>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no responder.
              </p>
            </div>
          </div>
        `,
      });
      return { success: true, message: 'Correo de bienvenida enviado' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error al enviar correo de bienvenida', 
        error: error.message 
      };
    }
  }

  // Enviar notificación de actualización de perfil
  async sendProfileUpdateEmail(docenteEmail: string, docenteNombre: string) {
    try {
      await this.mailerService.sendMail({
        to: docenteEmail,
        subject: '🔔 Actualización de Perfil - Sistema de Docentes',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px;">
              <h1 style="color: #FF9800;">Actualización de Perfil</h1>
              <p>Hola ${docenteNombre},</p>
              <p>Te informamos que tu perfil ha sido actualizado exitosamente.</p>
              <p>Si no realizaste estos cambios, por favor contacta al administrador inmediatamente.</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no responder.
              </p>
            </div>
          </div>
        `,
      });
      return { success: true, message: 'Notificación enviada' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error al enviar notificación', 
        error: error.message 
      };
    }
  }
}