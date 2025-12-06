import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Horario, HorarioDocument } from './schemas/horario.schema';

@Injectable()
export class HorariosService {
  constructor(@InjectModel(Horario.name) private horarioModel: Model<HorarioDocument>) {}

  async create(createHorarioDto: any): Promise<HorarioDocument> {
    const createdHorario = new this.horarioModel(createHorarioDto);
    return createdHorario.save();
  }

  async findAll(): Promise<HorarioDocument[]> {
    return this.horarioModel.find()
      .populate('docente')
      .populate('curso')
      .exec();
  }

  async findByDocente(docenteId: string): Promise<HorarioDocument[]> {
    return this.horarioModel.find({ docente: docenteId })
      .populate('curso')
      .exec();
  }

  async findById(id: string): Promise<HorarioDocument> {
    const horario = await this.horarioModel.findById(id)
      .populate('docente')
      .populate('curso')
      .exec();
    if (!horario) {
      throw new NotFoundException('Horario no encontrado');
    }
    return horario;
  }

  async update(id: string, updateHorarioDto: any): Promise<HorarioDocument> {
    const updatedHorario = await this.horarioModel
      .findByIdAndUpdate(id, updateHorarioDto, { new: true })
      .populate('docente')
      .populate('curso')
      .exec();
    
    if (!updatedHorario) {
      throw new NotFoundException('Horario no encontrado');
    }
    return updatedHorario;
  }

  async remove(id: string): Promise<void> {
    const result = await this.horarioModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Horario no encontrado');
    }
  }
}