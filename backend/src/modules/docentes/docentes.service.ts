import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Docente } from '../../schemas/docente.schema';

@Injectable()
export class DocentesService {
  constructor(@InjectModel('Docente') private docenteModel: Model<Docente>) {}

  async findAll() {
    return this.docenteModel.find().exec();
  }

  async create(body: any) {
    const nuevo = new this.docenteModel(body);
    return nuevo.save();
  }

  async update(id: string, body: any) {
    return this.docenteModel.findByIdAndUpdate(id, body, { new: true }).exec();
  }

  async remove(id: string) {
    return this.docenteModel.findByIdAndDelete(id).exec();
  }
}
