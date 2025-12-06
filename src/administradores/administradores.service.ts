import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Administrador, AdministradorDocument } from './schemas/administrador.schema';

@Injectable()
export class AdministradoresService {
  constructor(@InjectModel(Administrador.name) private administradorModel: Model<AdministradorDocument>) {}

  async findByEmail(email: string): Promise<AdministradorDocument | null> {
    // Incluir password para validación de login
    return this.administradorModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<AdministradorDocument> {
    const administrador = await this.administradorModel.findById(id).select('-password').exec();
    if (!administrador) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return administrador;
  }

  async create(createAdministradorDto: any): Promise<AdministradorDocument> {
    const createdAdministrador = new this.administradorModel(createAdministradorDto);
    return createdAdministrador.save();
  }

  async findAll(): Promise<AdministradorDocument[]> {
    return this.administradorModel.find().select('-password').exec();
  }

  async update(id: string, updateAdministradorDto: any): Promise<AdministradorDocument> {
    const updatedAdministrador = await this.administradorModel
      .findByIdAndUpdate(id, updateAdministradorDto, { new: true })
      .select('-password')
      .exec();
    
    if (!updatedAdministrador) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return updatedAdministrador;
  }

  async remove(id: string): Promise<void> {
    const result = await this.administradorModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Administrador no encontrado');
    }
  }
}

