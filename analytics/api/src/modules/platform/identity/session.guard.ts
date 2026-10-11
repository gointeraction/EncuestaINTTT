import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator.js';
import { readStaffSession } from '../../../shared/security/cookies.js';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { IdentityService } from './identity.service.js';

/**
 * SessionGuard — exige una sesión de staff válida salvo en rutas `@Public()`.
 * Deja el usuario en `req.staffUser`.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly identity: IdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { staffUser?: StaffSessionUser }>();
    const token = readStaffSession(req);
    if (!token) throw new UnauthorizedException('Sesión requerida');

    const user = await this.identity.resolveSession(token);
    if (!user) throw new UnauthorizedException('Sesión inválida o expirada');

    req.staffUser = user;
    return true;
  }
}
