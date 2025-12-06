import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { AdministradoresService } from './administradores.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('administradores')
@UseGuards(JwtAuthGuard)
export class AdministradoresController {
  constructor(private readonly administradoresService: AdministradoresService) {}

  @Post()
  create(@Body() createAdministradorDto: any) {
    return this.administradoresService.create(createAdministradorDto);
  }

  @Get()
  findAll() {
    return this.administradoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administradoresService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAdministradorDto: any) {
    return this.administradoresService.update(id, updateAdministradorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administradoresService.remove(id);
  }
}

