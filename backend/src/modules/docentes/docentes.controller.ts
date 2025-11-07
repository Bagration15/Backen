import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { DocentesService } from './docentes.service';

@Controller('docentes')
export class DocentesController {
  constructor(private readonly docentesService: DocentesService) {}

  @Get()
  findAll() {
    return this.docentesService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.docentesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.docentesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.docentesService.remove(id);
  }
}
