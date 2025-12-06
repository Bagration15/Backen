import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Docente, DocenteDocument } from './schemas/docente.schema';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DocentesService {
  constructor(@InjectModel(Docente.name) private docenteModel: Model<DocenteDocument>) { }

  async findByEmail(email: string): Promise<DocenteDocument | null> {
    // Incluir password para validación de login
    return this.docenteModel.findOne({ email }).select('+password').exec();
  }

  async findByCedula(numeroCedula: string): Promise<DocenteDocument | null> {
    // Incluir password para validación de login
    return this.docenteModel.findOne({ numeroCedula }).select('+password').exec();
  }

  async findById(id: string): Promise<DocenteDocument> {
    const docente = await this.docenteModel.findById(id).select('-password').exec();
    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return docente;
  }

  async create(createDocenteDto: CreateDocenteDto): Promise<DocenteDocument> {
    // Verificar si el número de cédula ya existe
    const existingDocentePorCedula = await this.findByCedula(createDocenteDto.numeroCedula);
    if (existingDocentePorCedula) {
      throw new ConflictException(`El número de cédula ${createDocenteDto.numeroCedula} ya está registrado`);
    }

    // Verificar si el email ya existe
    const existingDocentePorEmail = await this.findByEmail(createDocenteDto.email);
    if (existingDocentePorEmail) {
      throw new ConflictException(`El email ${createDocenteDto.email} ya está registrado`);
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createDocenteDto.password, 10);

    const createdDocente = new this.docenteModel({
      ...createDocenteDto,
      password: hashedPassword,
      activo: createDocenteDto.activo !== undefined ? createDocenteDto.activo : true,
    });
    return createdDocente.save();
  }

  async findAll(): Promise<DocenteDocument[]> {
    return this.docenteModel.find().select('-password').exec();
  }

  async update(id: string, updateDocenteDto: UpdateDocenteDto): Promise<DocenteDocument> {
    const docente = await this.findById(id);

    // Si se está actualizando el número de cédula, verificar que no exista
    if (updateDocenteDto.numeroCedula && updateDocenteDto.numeroCedula !== docente.numeroCedula) {
      const existingDocentePorCedula = await this.findByCedula(updateDocenteDto.numeroCedula);
      if (existingDocentePorCedula) {
        throw new ConflictException(`El número de cédula ${updateDocenteDto.numeroCedula} ya está registrado`);
      }
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateDocenteDto.email && updateDocenteDto.email !== docente.email) {
      const existingDocentePorEmail = await this.findByEmail(updateDocenteDto.email);
      if (existingDocentePorEmail) {
        throw new ConflictException(`El email ${updateDocenteDto.email} ya está registrado`);
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateDocenteDto.password) {
      updateDocenteDto.password = await bcrypt.hash(updateDocenteDto.password, 10);
    }

    const updatedDocente = await this.docenteModel
      .findByIdAndUpdate(id, updateDocenteDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedDocente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return updatedDocente;
  }

  async remove(id: string): Promise<void> {
    const result = await this.docenteModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Docente no encontrado');
    }
  }
}