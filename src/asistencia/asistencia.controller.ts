import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('asistencia')
@UseGuards(JwtAuthGuard)
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  @Post()
  create(@Body() createAsistenciaDto: any) {
    return this.asistenciaService.create(createAsistenciaDto);
  }

  @Get()
  findAll() {
    return this.asistenciaService.findAll();
  }

  @Get('docente/:docenteId')
  findByDocente(@Param('docenteId') docenteId: string) {
    return this.asistenciaService.findByDocente(docenteId);
  }

  @Get('curso/:cursoId')
  findByCurso(@Param('cursoId') cursoId: string) {
    return this.asistenciaService.findByCurso(cursoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asistenciaService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAsistenciaDto: any) {
    return this.asistenciaService.update(id, updateAsistenciaDto);
  }

  @Put(':id/registrar')
  registrarAsistencia(@Param('id') id: string, @Body() body: { estudiantesPresentes: string[] }) {
    return this.asistenciaService.registrarAsistencia(id, body.estudiantesPresentes);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asistenciaService.remove(id);
  }
}