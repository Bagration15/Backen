import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { DocentesService } from './docentes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateDocenteDto } from './dto/create-docente.dto';
import { UpdateDocenteDto } from './dto/update-docente.dto';

@Controller('docentes')
@UseGuards(JwtAuthGuard)
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() createDocenteDto: CreateDocenteDto) {
    return this.docentesService.create(createDocenteDto);
  }

  @Get()
  findAll() {
    return this.docentesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docentesService.findById(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(@Param('id') id: string, @Body() updateDocenteDto: UpdateDocenteDto) {
    return this.docentesService.update(id, updateDocenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docentesService.remove(id);
  }
}