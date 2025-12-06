import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  create(@Body() createUserDto: {
    nombre: string;
    email: string;
    password: string;
    role: 'estudiante' | 'docente' | 'administrador';
    matricula?: string;
    carrera?: string;
    semestre?: number;
    departamento?: string;
    especialidad?: string;
    cargo?: string;
    telefono?: string;
  }) {
    return this.usuariosService.createUser(createUserDto);
  }

  @Get()
  findAll(@Query('role') role?: 'estudiante' | 'docente' | 'administrador') {
    if (role) {
      return this.usuariosService.findAllByRole(role);
    }
    return { message: 'Especifica un rol: ?role=estudiante|docente|administrador' };
  }

  @Get('buscar/:email')
  findByEmail(@Param('email') email: string) {
    return this.usuariosService.findUserByEmail(email);
  }

  @Get('ver/:role/:id')
  findOne(@Param('role') role: 'estudiante' | 'docente' | 'administrador', @Param('id') id: string) {
    return this.usuariosService.findUserById(id, role);
  }

  @Put('ver/:role/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  update(
    @Param('role') role: 'estudiante' | 'docente' | 'administrador',
    @Param('id') id: string,
    @Body() updateUserDto: any
  ) {
    return this.usuariosService.updateUser(id, role, updateUserDto);
  }

  @Delete('ver/:role/:id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  remove(@Param('role') role: 'estudiante' | 'docente' | 'administrador', @Param('id') id: string) {
    return this.usuariosService.deleteUser(id, role);
  }
}

