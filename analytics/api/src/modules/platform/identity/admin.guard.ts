import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';

/** AdminGuard — exige rol `admin` (o permiso `*`) sobre una sesión de staff ya resuelta. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { staffUser?: StaffSessionUser }>();
    const user = req.staffUser;
    if (user && (user.role === 'admin' || user.permissions?.includes('*'))) return true;
    throw new ForbiddenException('Requiere rol administrador');
  }
}
