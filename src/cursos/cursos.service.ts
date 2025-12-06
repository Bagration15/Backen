import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Curso, CursoDocument } from './schemas/curso.schema';

@Injectable()
export class CursosService {
  constructor(@InjectModel(Curso.name) private cursoModel: Model<CursoDocument>) {}

  async create(createCursoDto: any): Promise<CursoDocument> {
    const createdCurso = new this.cursoModel(createCursoDto);
    return createdCurso.save();
  }

  async findAll(): Promise<CursoDocument[]> {
    return this.cursoModel.find().populate('docente').exec();
  }

  async findById(id: string): Promise<CursoDocument> {
    const curso = await this.cursoModel.findById(id).populate('docente').exec();
    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }
    return curso;
  }

  async update(id: string, updateCursoDto: any): Promise<CursoDocument> {
    const updatedCurso = await this.cursoModel
      .findByIdAndUpdate(id, updateCursoDto, { new: true })
      .populate('docente')
      .exec();
    
    if (!updatedCurso) {
      throw new NotFoundException('Curso no encontrado');
    }
    return updatedCurso;
  }

  async remove(id: string): Promise<void> {
    const result = await this.cursoModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Curso no encontrado');
    }
  }
}