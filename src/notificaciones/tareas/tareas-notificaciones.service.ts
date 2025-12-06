import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Horario, HorarioDocument } from '../../horarios/schemas/horario.schema';
import { Asistencia, AsistenciaDocument } from '../../asistencia/schemas/asistencia.schema';
import { Docente, DocenteDocument } from '../../docentes/schemas/docente.schema';
import { Administrador, AdministradorDocument } from '../../administradores/schemas/administrador.schema';
import { NotificacionesService } from '../notificaciones.service';
import { ConfiguracionNotificacionesService } from '../configuracion-notificaciones.service';

@Injectable()
export class TareasNotificacionesService {
  private readonly logger = new Logger(TareasNotificacionesService.name);

  constructor(
    @InjectModel(Horario.name) private horarioModel: Model<HorarioDocument>,
    @InjectModel(Asistencia.name) private asistenciaModel: Model<AsistenciaDocument>,
    @InjectModel(Docente.name) private docenteModel: Model<DocenteDocument>,
    @InjectModel(Administrador.name) private administradorModel: Model<AdministradorDocument>,
    private notificacionesService: NotificacionesService,
    @Inject(forwardRef(() => ConfiguracionNotificacionesService))
    private configuracionService: ConfiguracionNotificacionesService,
  ) {}

  // Ejecutar cada hora para verificar si es momento de ejecutar según configuración
  @Cron('0 * * * *') // Cada hora en el minuto 0
  async verificarFaltasYAsistencias() {
    try {
      // Obtener configuración activa
      const config = await this.configuracionService.obtenerConfiguracionActiva();
      if (!config) {
        this.logger.warn('No hay configuración activa, usando horario por defecto');
      }

      const horaConfigurada = config?.horarioVerificacionPrincipal || '20:00';
      const horaActual = new Date();
      const horaActualStr = `${horaActual.getHours().toString().padStart(2, '0')}:${horaActual.getMinutes().toString().padStart(2, '0')}`;

      // Solo ejecutar si coincide con la hora configurada
      if (horaActualStr !== horaConfigurada) {
        return; // No es la hora configurada
      }

      this.logger.log(`Iniciando verificación de faltas y asistencias no registradas (hora configurada: ${horaConfigurada})...`);
    
    try {
      const hoy = new Date();
      const diaSemana = this.obtenerDiaSemana(hoy);
      
      // Obtener todos los horarios activos para el día de hoy
      const horarios = await this.horarioModel.find({
        diaSemana: diaSemana,
        activo: true,
      }).populate('docente').populate('curso').exec();

      this.logger.log(`Encontrados ${horarios.length} horarios para ${diaSemana}`);

      for (const horario of horarios) {
        const docente = horario.docente as any;
        const curso = horario.curso as any;
        
        if (!docente || !curso) {
          continue;
        }

        // Verificar si existe un registro de asistencia para hoy
        const inicioDia = new Date(hoy);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(hoy);
        finDia.setHours(23, 59, 59, 999);

        const asistencia = await this.asistenciaModel.findOne({
          docente: docente._id,
          curso: curso._id,
          fecha: {
            $gte: inicioDia,
            $lte: finDia,
          },
        }).exec();

        // Si no hay registro de asistencia, verificar si la clase ya debería haber terminado
        if (!asistencia) {
          const horaFin = this.parsearHora(horario.horaFin);
          const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
          
          // Si ya pasó la hora de fin de la clase, enviar notificación
          if (horaActual >= horaFin) {
            this.logger.warn(`Docente ${docente.nombre} no registró asistencia para ${curso.nombre}`);
            
            // Enviar notificación al docente
            try {
              await this.notificacionesService.enviarNotificacionFalta(
                docente.email,
                docente.nombre,
                curso.nombre,
                hoy,
                'sin_registro',
                docente._id.toString(),
                curso._id.toString()
              );
            } catch (error) {
              this.logger.error(`Error al enviar notificación a docente ${docente.email}:`, error);
            }

            // Enviar notificación a todos los administradores
            await this.notificarAdministradores(docente.nombre, curso.nombre, hoy, 'sin_registro');
          }
        } else if (asistencia.estado === 'pendiente') {
          // Si hay registro pero está pendiente y ya pasó la hora de fin
          const horaFin = this.parsearHora(horario.horaFin);
          const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
          
          if (horaActual >= horaFin) {
            this.logger.warn(`Docente ${docente.nombre} tiene asistencia pendiente para ${curso.nombre}`);
            
            // Enviar notificación al docente
            try {
              await this.notificacionesService.enviarNotificacionFalta(
                docente.email,
                docente.nombre,
                curso.nombre,
                hoy,
                'sin_registro',
                docente._id.toString(),
                curso._id.toString()
              );
            } catch (error) {
              this.logger.error(`Error al enviar notificación a docente ${docente.email}:`, error);
            }

            // Enviar notificación a todos los administradores
            await this.notificarAdministradores(docente.nombre, curso.nombre, hoy, 'sin_registro');
          }
        }
      }

      this.logger.log('Verificación de faltas y asistencias completada');
    } catch (error) {
      this.logger.error('Error en la verificación de faltas y asistencias:', error);
    }
  }

  // Ejecutar cada hora para verificar si es momento de ejecutar según configuración
  @Cron('0 * * * *') // Cada hora en el minuto 0
  async verificarFaltasTemprano() {
    try {
      // Obtener configuración activa
      const config = await this.configuracionService.obtenerConfiguracionActiva();
      if (!config) {
        this.logger.warn('No hay configuración activa, usando horario por defecto');
      }

      const horaConfigurada = config?.horarioVerificacionTemprana || '09:00';
      const horaActual = new Date();
      const horaActualStr = `${horaActual.getHours().toString().padStart(2, '0')}:${horaActual.getMinutes().toString().padStart(2, '0')}`;

      // Solo ejecutar si coincide con la hora configurada
      if (horaActualStr !== horaConfigurada) {
        return; // No es la hora configurada
      }

      this.logger.log(`Iniciando verificación temprana de faltas (hora configurada: ${horaConfigurada})...`);
    
    try {
      const hoy = new Date();
      const diaSemana = this.obtenerDiaSemana(hoy);
      
      // Obtener todos los horarios activos para el día de hoy
      const horarios = await this.horarioModel.find({
        diaSemana: diaSemana,
        activo: true,
      }).populate('docente').populate('curso').exec();

      const horaActual = hoy.getHours() * 60 + hoy.getMinutes();

      for (const horario of horarios) {
        const docente = horario.docente as any;
        const curso = horario.curso as any;
        
        if (!docente || !curso) {
          continue;
        }

        const horaInicio = this.parsearHora(horario.horaInicio);
        const horaFin = this.parsearHora(horario.horaFin);
        
        // Si la clase ya debería haber comenzado pero aún no ha terminado
        if (horaActual >= horaInicio && horaActual < horaFin) {
          // Verificar si hay registro de asistencia
          const inicioDia = new Date(hoy);
          inicioDia.setHours(0, 0, 0, 0);
          const finDia = new Date(hoy);
          finDia.setHours(23, 59, 59, 999);

          const asistencia = await this.asistenciaModel.findOne({
            docente: docente._id,
            curso: curso._id,
            fecha: {
              $gte: inicioDia,
              $lte: finDia,
            },
          }).exec();

          // Si no hay registro y la clase ya comenzó, podría ser una falta
          // (Esto es más una advertencia temprana, no una notificación definitiva)
          if (!asistencia) {
            this.logger.warn(`Posible falta: Docente ${docente.nombre} no tiene registro de asistencia para ${curso.nombre} que comenzó a las ${horario.horaInicio}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error en la verificación temprana de faltas:', error);
    }
  }

  private async notificarAdministradores(
    nombreDocente: string,
    nombreCurso: string,
    fecha: Date,
    motivo: 'falta' | 'sin_registro'
  ) {
    try {
      // Obtener configuración activa
      const config = await this.configuracionService.obtenerConfiguracionActiva();
      
      // Notificar a administradores si está habilitado
      if (!config || config.enviarAAdministradores) {
        const administradores = await this.administradorModel.find({ activo: true }).exec();
        
        for (const admin of administradores) {
          try {
            await this.notificacionesService.enviarNotificacionAdministrador(
              admin.email,
              nombreDocente,
              nombreCurso,
              fecha,
              motivo
            );
          } catch (error) {
            this.logger.error(`Error al enviar notificación a administrador ${admin.email}:`, error);
          }
        }
      }

      // Notificar a destinatarios adicionales si está habilitado
      if (config && config.enviarADestinatariosAdicionales && config.destinatariosAdicionales?.length > 0) {
        for (const email of config.destinatariosAdicionales) {
          try {
            await this.notificacionesService.enviarNotificacionAdministrador(
              email,
              nombreDocente,
              nombreCurso,
              fecha,
              motivo
            );
          } catch (error) {
            this.logger.error(`Error al enviar notificación a destinatario adicional ${email}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error al obtener administradores para notificación:', error);
    }
  }

  private obtenerDiaSemana(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }

  private parsearHora(hora: string): number {
    // Formato esperado: "HH:MM" o "HHMM"
    const partes = hora.split(':');
    if (partes.length === 2) {
      return parseInt(partes[0]) * 60 + parseInt(partes[1]);
    }
    // Si no tiene formato estándar, intentar parsear como número
    const horaNum = parseInt(hora);
    if (!isNaN(horaNum)) {
      return Math.floor(horaNum / 100) * 60 + (horaNum % 100);
    }
    return 0;
  }
}

