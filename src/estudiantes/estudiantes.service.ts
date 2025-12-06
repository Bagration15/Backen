import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Estudiante, EstudianteDocument } from './schemas/estudiante.schema';

@Injectable()
export class EstudiantesService {
  constructor(@InjectModel(Estudiante.name) private estudianteModel: Model<EstudianteDocument>) {}

  async findByEmail(email: string): Promise<EstudianteDocument | null> {
    return this.estudianteModel.findOne({ email }).exec();
  }

  async create(createEstudianteDto: any): Promise<EstudianteDocument> {
    const createdEstudiante = new this.estudianteModel(createEstudianteDto);
    return createdEstudiante.save();
  }

  async findAll(): Promise<EstudianteDocument[]> {
    return this.estudianteModel.find().exec();
  }

  async findById(id: string): Promise<EstudianteDocument> {
    const estudiante = await this.estudianteModel.findById(id).exec();
    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return estudiante;
  }

  async update(id: string, updateEstudianteDto: any): Promise<EstudianteDocument> {
    const updatedEstudiante = await this.estudianteModel
      .findByIdAndUpdate(id, updateEstudianteDto, { new: true })
      .exec();
    
    if (!updatedEstudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return updatedEstudiante;
  }

  async remove(id: string): Promise<void> {
    const result = await this.estudianteModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Estudiante no encontrado');
    }
  }
}