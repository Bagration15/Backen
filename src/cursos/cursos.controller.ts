import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('cursos')
@UseGuards(JwtAuthGuard)
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  create(@Body() createCursoDto: any) {
    return this.cursosService.create(createCursoDto);
  }

  @Get()
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cursosService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCursoDto: any) {
    return this.cursosService.update(id, updateCursoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cursosService.remove(id);
  }
}