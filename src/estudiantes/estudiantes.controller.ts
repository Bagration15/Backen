import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Post()
  create(@Body() createEstudianteDto: any) {
    return this.estudiantesService.create(createEstudianteDto);
  }

  @Get()
  findAll() {
    return this.estudiantesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estudiantesService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateEstudianteDto: any) {
    return this.estudiantesService.update(id, updateEstudianteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estudiantesService.remove(id);
  }
}