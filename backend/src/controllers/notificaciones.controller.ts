import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificacionesService } from '../services/notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // Obtener todas las notificaciones
  @Get()
  async findAll() {
    return this.notificacionesService.findAll();
  }

  // Enviar una notificación manual
  @Post()
  async enviarNotificacion(@Body() body: any) {
    const { docenteId, mensaje } = body;
    return this.notificacionesService.enviarNotificacion(docenteId, mensaje);
  }
}
