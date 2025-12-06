import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asistencia, AsistenciaDocument } from './schemas/asistencia.schema';
import { NotificacionesHistorialService } from '../notificaciones/notificaciones-historial.service';

@Injectable()
export class AsistenciaService {
  constructor(
    @InjectModel(Asistencia.name) private asistenciaModel: Model<AsistenciaDocument>,
    @Inject(forwardRef(() => NotificacionesHistorialService))
    private historialService: NotificacionesHistorialService,
  ) { }

  async create(createAsistenciaDto: any): Promise<AsistenciaDocument> {
    const createdAsistencia = new this.asistenciaModel(createAsistenciaDto);
    return createdAsistencia.save();
  }

  async findAll(): Promise<AsistenciaDocument[]> {
    return this.asistenciaModel.find()
      .populate('docente')
      .populate('curso')
      .populate('estudiantesPresentes')
      .exec();
  }

  async findByDocente(docenteId: string): Promise<AsistenciaDocument[]> {
    return this.asistenciaModel.find({ docente: docenteId })
      .populate('docente')
      .populate('curso')
      .populate('estudiantesPresentes')
      .exec();
  }

  async findByCurso(cursoId: string): Promise<AsistenciaDocument[]> {
    return this.asistenciaModel.find({ curso: cursoId })
      .populate('docente')
      .populate('curso')
      .populate('estudiantesPresentes')
      .exec();
  }

  async findById(id: string): Promise<AsistenciaDocument> {
    const asistencia = await this.asistenciaModel.findById(id)
      .populate('docente')
      .populate('curso')
      .populate('estudiantesPresentes')
      .exec();
    if (!asistencia) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }
    return asistencia;
  }

  async update(id: string, updateAsistenciaDto: any): Promise<AsistenciaDocument> {
    const updatedAsistencia = await this.asistenciaModel
      .findByIdAndUpdate(id, updateAsistenciaDto, { new: true })
      .populate('docente')
      .populate('curso')
      .populate('estudiantesPresentes')
      .exec();

    if (!updatedAsistencia) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }
    return updatedAsistencia;
  }

  async registrarAsistencia(id: string, estudiantesPresentes: string[]): Promise<AsistenciaDocument> {
    const asistencia = await this.asistenciaModel.findByIdAndUpdate(
      id,
      {
        estudiantesPresentes,
        estado: 'finalizada'
      },
      { new: true }
    )
      .populate('docente', 'nombre email')
      .populate('curso', 'nombre codigo')
      .populate('estudiantesPresentes')
      .exec();

    if (!asistencia) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }

    // Registrar en el historial de notificaciones para que aparezca en el dashboard del admin
    try {
      const docente = asistencia.docente as any;
      const curso = asistencia.curso as any;

      if (docente && curso) {
        await this.historialService.crearRegistro({
          docente: docente._id.toString(),
          curso: curso._id.toString(),
          emailDestinatario: docente.email,
          nombreDocente: docente.nombre,
          nombreCurso: curso.nombre || curso.codigo,
          fechaClase: asistencia.fecha,
          motivo: 'sin_registro', // Cuando se registra asistencia, el motivo es que antes no estaba registrada
          estado: 'enviado',
          notificacionAdministrador: false,
          tipoRegistro: 'asistencia_registrada', // Indicar que es un registro de asistencia, no una notificación
        });
      }
    } catch (error) {
      // No fallar si hay error al registrar en historial
      console.error('Error al registrar en historial de notificaciones:', error);
    }

    return asistencia;
  }

  async remove(id: string): Promise<void> {
    const result = await this.asistenciaModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Registro de asistencia no encontrado');
    }
  }
}