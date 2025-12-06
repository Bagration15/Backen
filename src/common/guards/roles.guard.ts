import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true; // Si no hay roles requeridos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }

    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new ForbiddenException(`Solo los usuarios con rol: ${requiredRoles.join(', ')} pueden realizar esta acción`);
    }

    return true;
  }
}

