import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * SessionGuard — placeholder de F1. Las rutas decoradas con `@Public()` pasan;
 * el resto exige sesión. La validación real de la sesión de staff se implementa
 * en F2 (platform/identity), local y federable.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, context.getHandler()) === true
      || Reflect.getMetadata(IS_PUBLIC_KEY, context.getClass()) === true;
    if (isPublic) {
      return true;
    }
    // TODO(F2): validar la sesión de staff (cookie firmada / estrategia Passport).
    return true;
  }
}
