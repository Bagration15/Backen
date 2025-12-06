import { Controller, Post, Body, UseGuards, Get, Query, Request, Logger, BadRequestException, Put, Delete, Param } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { TareasNotificacionesService } from './tareas/tareas-notificaciones.service';
import { NotificacionesHistorialService } from './notificaciones-historial.service';
import { ConfiguracionNotificacionesService } from './configuracion-notificaciones.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  private readonly logger = new Logger(NotificacionesController.name);

  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly tareasNotificacionesService: TareasNotificacionesService,
    private readonly historialService: NotificacionesHistorialService,
    private readonly configuracionService: ConfiguracionNotificacionesService,
  ) { }

  @Get('verificar-configuracion')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async verificarConfiguracion() {
    const configuracionValida = await this.notificacionesService.verificarConfiguracion();
    return {
      configuracionValida,
      mensaje: configuracionValida
        ? 'Configuración de email válida'
        : 'Error en la configuración de email. Verifique las variables de entorno.',
    };
  }

  @Post('enviar-prueba')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async enviarPrueba(@Body() body: { email: string }) {
    try {
      const resultado = await this.notificacionesService.enviarEmailPrueba(body.email);
      if (resultado.success) {
        return {
          success: true,
          mensaje: resultado.message,
        };
      } else {
        return {
          success: false,
          error: 'Error al enviar email de prueba',
          detalle: resultado.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al enviar email de prueba',
        detalle: error.message,
      };
    }
  }

  @Post('verificar-faltas-manual')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async verificarFaltasManual() {
    try {
      await this.tareasNotificacionesService.verificarFaltasYAsistencias();
      return { mensaje: 'Verificación de faltas ejecutada manualmente' };
    } catch (error) {
      return {
        error: 'Error al ejecutar verificación',
        detalle: error.message,
      };
    }
  }

  @Get('historial')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerHistorial(
    @Query('docente') docente?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('motivo') motivo?: 'falta' | 'sin_registro',
    @Query('estado') estado?: 'enviado' | 'error',
  ) {
    const filtros: any = {};
    if (docente) filtros.docente = docente;
    if (fechaDesde) filtros.fechaDesde = new Date(fechaDesde);
    if (fechaHasta) filtros.fechaHasta = new Date(fechaHasta);
    if (motivo) filtros.motivo = motivo;
    if (estado) filtros.estado = estado;

    return this.historialService.findAll(filtros);
  }

  @Get('estadisticas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerEstadisticas() {
    return this.historialService.obtenerEstadisticas();
  }

  // Endpoint para obtener notificaciones recientes (para dashboard del admin)
  @Get('recientes')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerRecientes(@Query('limite') limite?: string) {
    const limit = parseInt(limite || '10');
    return this.historialService.findRecientes(limit);
  }

  // Endpoint para enviar notificación manual desde admin a docente
  @Post('enviar-manual')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async enviarManual(@Body() body: {
    docenteId: string;
    motivo: 'falta' | 'sin_registro';
    mensajePersonalizado?: string;
  }) {
    try {
      const resultado = await this.notificacionesService.enviarNotificacionManual(
        body.docenteId,
        body.motivo,
        body.mensajePersonalizado
      );
      return {
        success: true,
        mensaje: 'Notificación enviada exitosamente',
        data: resultado,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al enviar notificación',
        detalle: error.message,
      };
    }
  }

  // Endpoint para que docentes vean sus notificaciones
  @Get('mis-notificaciones')
  @UseGuards(RolesGuard)
  @Roles('docente')
  async obtenerMisNotificaciones(@Request() req: any) {
    try {
      // El usuarioId viene del token JWT a través de request.user
      // JwtStrategy retorna { userId, email, role, nombre }
      this.logger.debug('Request user:', JSON.stringify(req.user));

      const userId = req.user?.userId || req.user?.sub;

      if (!userId) {
        this.logger.error('Usuario no identificado en el token JWT', req.user);
        throw new BadRequestException('Usuario no identificado en el token JWT');
      }

      this.logger.log(`Obteniendo notificaciones para docente: ${userId}`);
      const notificaciones = await this.historialService.findByDocente(userId);
      this.logger.log(`Encontradas ${notificaciones.length} notificaciones para docente ${userId}`);

      return notificaciones;
    } catch (error) {
      this.logger.error('Error al obtener notificaciones del docente:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener notificaciones: ${error.message}`);
    }
  }

  // Endpoint para obtener notificaciones del día (para dashboard)
  @Get('hoy')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerNotificacionesHoy() {
    return this.historialService.findToday();
  }

  // ========== ENDPOINTS DE CONFIGURACIÓN ==========

  // Obtener configuración activa
  @Get('configuracion')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerConfiguracion() {
    return this.configuracionService.obtenerConfiguracionActiva();
  }

  // Obtener todas las configuraciones
  @Get('configuracion/todas')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerTodasConfiguraciones() {
    return this.configuracionService.obtenerTodas();
  }

  // Obtener configuración por ID
  @Get('configuracion/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async obtenerConfiguracionPorId(@Param('id') id: string) {
    const config = await this.configuracionService.obtenerPorId(id);
    if (!config) {
      throw new BadRequestException('Configuración no encontrada');
    }
    return config;
  }

  // Crear nueva configuración
  @Post('configuracion')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async crearConfiguracion(@Body() body: any) {
    try {
      return await this.configuracionService.crear(body);
    } catch (error) {
      throw new BadRequestException(`Error al crear configuración: ${error.message}`);
    }
  }

  // Actualizar configuración
  @Put('configuracion/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async actualizarConfiguracion(@Param('id') id: string, @Body() body: any) {
    try {
      const config = await this.configuracionService.actualizar(id, body);
      if (!config) {
        throw new BadRequestException('Configuración no encontrada');
      }
      return config;
    } catch (error) {
      throw new BadRequestException(`Error al actualizar configuración: ${error.message}`);
    }
  }

  // Activar una configuración
  @Post('configuracion/:id/activar')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async activarConfiguracion(@Param('id') id: string) {
    try {
      const config = await this.configuracionService.activar(id);
      if (!config) {
        throw new BadRequestException('Configuración no encontrada');
      }
      return config;
    } catch (error) {
      throw new BadRequestException(`Error al activar configuración: ${error.message}`);
    }
  }

  // Eliminar configuración
  @Delete('configuracion/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  async eliminarConfiguracion(@Param('id') id: string) {
    try {
      const eliminado = await this.configuracionService.eliminar(id);
      if (!eliminado) {
        throw new BadRequestException('Configuración no encontrada');
      }
      return { mensaje: 'Configuración eliminada exitosamente' };
    } catch (error) {
      throw new BadRequestException(`Error al eliminar configuración: ${error.message}`);
    }
  }
}

