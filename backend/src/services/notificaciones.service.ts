// src/services/notificaciones.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notificacion } from '../schemas/notificacion.schema';
import { DocentesService } from './docentes.service';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectModel(Notificacion.name)
    private readonly notificacionModel: Model<Notificacion>,
    private readonly docentesService: DocentesService, // ← Usa el servicio, NO el modelo
  ) {}

  // Enviar notificación
  async enviarNotificacion(docenteId: string, mensaje: string) {
    const docente = await this.docentesService.findOne(docenteId);

    const nueva = new this.notificacionModel({
      docente: docente
        ? { id: docente._id, nombre: docente.nombre }
        : { id: null, nombre: 'Desconocido' },
      mensaje,
      fecha: new Date(),
    });

    return nueva.save();
  }

  async findAll() {
    return this.notificacionModel.find().sort({ fecha: -1 }).exec();
  }
}
