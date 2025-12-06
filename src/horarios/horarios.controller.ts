import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('horarios')
@UseGuards(JwtAuthGuard)
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  create(@Body() createHorarioDto: any) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  findAll() {
    return this.horariosService.findAll();
  }

  @Get('docente/:docenteId')
  findByDocente(@Param('docenteId') docenteId: string) {
    return this.horariosService.findByDocente(docenteId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.horariosService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateHorarioDto: any) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.horariosService.remove(id);
  }
}