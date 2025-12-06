import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notificacion, NotificacionDocument } from './schemas/notificacion.schema';
import { Curso, CursoDocument } from '../cursos/schemas/curso.schema';

@Injectable()
export class NotificacionesHistorialService {
  constructor(
    @InjectModel(Notificacion.name) private notificacionModel: Model<NotificacionDocument>,
    @InjectModel(Curso.name) private cursoModel: Model<CursoDocument>,
  ) { }

  async crearRegistro(notificacionData: {
    docente: string;
    curso?: string;
    emailDestinatario: string;
    nombreDocente: string;
    nombreCurso?: string;
    fechaClase: Date;
    motivo: 'falta' | 'sin_registro';
    estado: 'enviado' | 'error';
    mensajeError?: string;
    notificacionAdministrador?: boolean;
    emailAdministrador?: string;
    tipoRegistro?: 'notificacion' | 'asistencia_registrada';
  }): Promise<NotificacionDocument> {
    // Limpiar curso si es una cadena vacía o no válida
    const datosLimpios = {
      ...notificacionData,
      curso: notificacionData.curso && notificacionData.curso.trim() !== ''
        ? notificacionData.curso
        : undefined, // Usar undefined en lugar de cadena vacía
    };
    const notificacion = new this.notificacionModel(datosLimpios);
    return notificacion.save();
  }

  async findAll(filtros?: {
    docente?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    motivo?: 'falta' | 'sin_registro';
    estado?: 'enviado' | 'error';
  }): Promise<NotificacionDocument[]> {
    const query: any = {};

    if (filtros?.docente) {
      query.docente = filtros.docente;
    }

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      query.fechaClase = {};
      if (filtros.fechaDesde) {
        query.fechaClase.$gte = filtros.fechaDesde;
      }
      if (filtros.fechaHasta) {
        query.fechaClase.$lte = filtros.fechaHasta;
      }
    }

    if (filtros?.motivo) {
      query.motivo = filtros.motivo;
    }

    if (filtros?.estado) {
      query.estado = filtros.estado;
    }

    try {
      // Obtener sin populate de curso inicialmente para evitar errores
      const notificaciones = await this.notificacionModel
        .find(query)
        .populate('docente', 'nombre email')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Procesar cursos manualmente para manejar valores vacíos
      const notificacionesProcesadas = await Promise.all(
        notificaciones.map(async (notif: any) => {
          // Limpiar curso si es una cadena vacía o no válido
          const cursoValue: any = notif.curso;
          if (!cursoValue ||
            cursoValue === '' ||
            (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
            notif.curso = null;
            return notif as NotificacionDocument;
          }

          // Si es un ObjectId válido (24 caracteres hex), intentar populate manual
          if (typeof cursoValue === 'string' && /^[0-9a-fA-F]{24}$/.test(cursoValue)) {
            try {
              const cursoDoc = await this.cursoModel.findById(cursoValue).select('nombre codigo').lean();
              notif.curso = cursoDoc || null;
            } catch {
              notif.curso = null;
            }
          } else if (typeof cursoValue === 'string') {
            // No es un ObjectId válido, establecer como null
            notif.curso = null;
          }
          // Si ya es un objeto (populate funcionó), dejarlo tal cual

          return notif as NotificacionDocument;
        })
      );

      return notificacionesProcesadas;
    } catch (error) {
      // Si hay un error, intentar sin populate de docente también
      const notificaciones = await this.notificacionModel
        .find(query)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Procesar manualmente docente y curso
      const notificacionesProcesadas = await Promise.all(
        notificaciones.map(async (notif: any) => {
          // Limpiar curso inválido
          const cursoValue: any = notif.curso;
          if (!cursoValue ||
            cursoValue === '' ||
            (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
            notif.curso = null;
          } else if (typeof cursoValue === 'string' && /^[0-9a-fA-F]{24}$/.test(cursoValue)) {
            try {
              const cursoDoc = await this.cursoModel.findById(cursoValue).select('nombre codigo').lean();
              notif.curso = cursoDoc || null;
            } catch {
              notif.curso = null;
            }
          } else if (typeof cursoValue === 'string') {
            notif.curso = null;
          }

          return notif as NotificacionDocument;
        })
      );

      return notificacionesProcesadas;
    }
  }

  async findById(id: string): Promise<NotificacionDocument> {
    try {
      const notificacion = await this.notificacionModel
        .findById(id)
        .populate('docente', 'nombre email')
        .populate('curso', 'nombre codigo')
        .lean()
        .exec();

      if (!notificacion) {
        return null;
      }

      // Limpiar curso si es inválido
      const notifAny: any = notificacion;
      const cursoValue: any = notifAny.curso;
      if (!cursoValue ||
        cursoValue === '' ||
        (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
        notifAny.curso = null;
      } else if (typeof cursoValue === 'string' && /^[0-9a-fA-F]{24}$/.test(cursoValue)) {
        try {
          const cursoDoc = await this.cursoModel.findById(cursoValue).select('nombre codigo').lean();
          notifAny.curso = cursoDoc || null;
        } catch {
          notifAny.curso = null;
        }
      } else if (typeof cursoValue === 'string') {
        notifAny.curso = null;
      }

      return notifAny as NotificacionDocument;
    } catch (error) {
      // Si falla con populate, intentar sin populate de curso
      const notificacion = await this.notificacionModel
        .findById(id)
        .populate('docente', 'nombre email')
        .lean()
        .exec();

      if (!notificacion) {
        return null;
      }

      // Procesar curso manualmente
      const notifAny: any = notificacion;
      const cursoValue: any = notifAny.curso;
      if (!cursoValue ||
        cursoValue === '' ||
        (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
        notifAny.curso = null;
      } else if (typeof cursoValue === 'string' && /^[0-9a-fA-F]{24}$/.test(cursoValue)) {
        try {
          const cursoDoc = await this.cursoModel.findById(cursoValue).select('nombre codigo').lean();
          notifAny.curso = cursoDoc || null;
        } catch {
          notifAny.curso = null;
        }
      } else if (typeof cursoValue === 'string') {
        notifAny.curso = null;
      }

      return notifAny as NotificacionDocument;
    }
  }

  async obtenerEstadisticas() {
    const total = await this.notificacionModel.countDocuments().exec();
    const enviadas = await this.notificacionModel.countDocuments({ estado: 'enviado' }).exec();
    const errores = await this.notificacionModel.countDocuments({ estado: 'error' }).exec();
    const porMotivo = await this.notificacionModel.aggregate([
      {
        $group: {
          _id: '$motivo',
          count: { $sum: 1 },
        },
      },
    ]).exec();

    return {
      total,
      enviadas,
      errores,
      porMotivo: porMotivo.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  // Obtener notificaciones recientes para dashboard
  async findRecientes(limit: number = 10): Promise<NotificacionDocument[]> {
    try {
      const notificaciones = await this.notificacionModel
        .find()
        .populate('docente', 'nombre email numeroCedula')
        .populate('curso', 'nombre codigo')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Procesar y limpiar cursos inválidos
      return notificaciones.map((notif: any) => {
        const cursoValue: any = notif.curso;
        if (!cursoValue ||
          cursoValue === '' ||
          (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
          notif.curso = null;
        }
        return notif as NotificacionDocument;
      });
    } catch (error) {
      // Si falla, intentar sin populate de curso
      const notificaciones = await this.notificacionModel
        .find()
        .populate('docente', 'nombre email numeroCedula')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Procesar cursos manualmente
      const notificacionesProcesadas = await Promise.all(
        notificaciones.map(async (notif: any) => {
          const cursoValue: any = notif.curso;
          if (!cursoValue ||
            cursoValue === '' ||
            (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
            notif.curso = null;
            return notif;
          }

          if (typeof cursoValue === 'string' && /^[0-9a-fA-F]{24}$/.test(cursoValue)) {
            try {
              const cursoDoc = await this.cursoModel.findById(cursoValue).select('nombre codigo').lean();
              notif.curso = cursoDoc || null;
            } catch {
              notif.curso = null;
            }
          } else if (typeof cursoValue === 'string') {
            notif.curso = null;
          }

          return notif as NotificacionDocument;
        })
      );

      return notificacionesProcesadas;
    }
  }

  // Obtener notificaciones por docente
  async findByDocente(docenteId: string): Promise<NotificacionDocument[]> {
    try {
      // Obtener todas las notificaciones del docente sin populate de curso inicialmente
      // Esto evita el error cuando curso es una cadena vacía
      const notificaciones = await this.notificacionModel
        .find({
          docente: docenteId,
          notificacionAdministrador: false
        })
        .populate('docente', 'nombre email')
        .sort({ createdAt: -1 })
        .lean() // Usar lean() para evitar problemas con documentos Mongoose
        .exec();

      // Limpiar y procesar notificaciones
      const notificacionesProcesadas = await Promise.all(
        notificaciones.map(async (notif: any) => {
          // Limpiar curso si es una cadena vacía o no válido
          if (!notif.curso ||
            notif.curso === '' ||
            (typeof notif.curso === 'string' && notif.curso.trim() === '')) {
            notif.curso = null;
            return notif;
          }

          // Si curso es un string que parece ObjectId válido (24 caracteres hex), intentar populate
          if (typeof notif.curso === 'string' && /^[0-9a-fA-F]{24}$/.test(notif.curso)) {
            try {
              // Hacer populate manualmente solo si es un ObjectId válido
              const cursoDoc = await this.cursoModel.findById(notif.curso).select('nombre codigo').lean();
              if (cursoDoc) {
                notif.curso = cursoDoc;
              } else {
                notif.curso = null;
              }
            } catch (error) {
              // Si falla, establecer curso como null
              notif.curso = null;
            }
          } else if (typeof notif.curso === 'string') {
            // No es un ObjectId válido, establecer como null
            notif.curso = null;
          }
          // Si ya es un objeto, dejarlo tal cual

          return notif;
        })
      );

      return notificacionesProcesadas as NotificacionDocument[];
    } catch (error) {
      // Si hay un error, intentar sin populate de curso
      const notificaciones = await this.notificacionModel
        .find({
          docente: docenteId,
          notificacionAdministrador: false
        })
        .populate('docente', 'nombre email')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Limpiar cursos inválidos sin intentar populate
      return notificaciones.map((notif: any) => {
        if (!notif.curso ||
          notif.curso === '' ||
          (typeof notif.curso === 'string' && notif.curso.trim() === '')) {
          notif.curso = null;
        }
        return notif as NotificacionDocument;
      });
    }
  }

  // Obtener notificaciones del día actual
  async findToday(): Promise<NotificacionDocument[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    try {
      const notificaciones = await this.notificacionModel
        .find({
          createdAt: {
            $gte: hoy,
            $lte: finDia,
          },
        })
        .populate('docente', 'nombre email numeroCedula')
        .populate('curso', 'nombre codigo')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Procesar y limpiar cursos inválidos
      return notificaciones.map((notif: any) => {
        const cursoValue: any = notif.curso;
        if (!cursoValue ||
          cursoValue === '' ||
          (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
          notif.curso = null;
        }
        return notif as NotificacionDocument;
      });
    } catch (error) {
      // Si falla, intentar sin populate de curso
      const notificaciones = await this.notificacionModel
        .find({
          createdAt: {
            $gte: hoy,
            $lte: finDia,
          },
        })
        .populate('docente', 'nombre email numeroCedula')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      // Procesar cursos manualmente
      const notificacionesProcesadas = await Promise.all(
        notificaciones.map(async (notif: any) => {
          const cursoValue: any = notif.curso;
          if (!cursoValue ||
            cursoValue === '' ||
            (typeof cursoValue === 'string' && cursoValue.trim() === '')) {
            notif.curso = null;
            return notif;
          }

          if (typeof cursoValue === 'string' && /^[0-9a-fA-F]{24}$/.test(cursoValue)) {
            try {
              const cursoDoc = await this.cursoModel.findById(cursoValue).select('nombre codigo').lean();
              notif.curso = cursoDoc || null;
            } catch {
              notif.curso = null;
            }
          } else if (typeof cursoValue === 'string') {
            notif.curso = null;
          }

          return notif as NotificacionDocument;
        })
      );

      return notificacionesProcesadas;
    }
  }
}

