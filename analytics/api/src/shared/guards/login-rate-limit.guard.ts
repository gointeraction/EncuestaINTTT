import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { RedisService } from '../../core/redis/redis.service.js';

const MAX_ATTEMPTS = 10;
const WINDOW_SECONDS = 60;

/**
 * LoginRateLimitGuard — límite de intentos de login por IP usando Redis (ventana
 * de 60 s). Si Redis no está disponible, no bloquea (degradación con gracia).
 */
@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const fwd = req.headers['x-forwarded-for'];
    const ip =
      (typeof fwd === 'string' ? fwd.split(',')[0].trim() : '') ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `rl:login:${ip}`;
    try {
      const attempts = await this.redis.client.incr(key);
      if (attempts === 1) {
        await this.redis.client.expire(key, WINDOW_SECONDS);
      }
      if (attempts > MAX_ATTEMPTS) {
        throw new HttpException(
          'Demasiados intentos de acceso. Intente más tarde.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err) {
      if (err instanceof HttpException) throw err;
      // Redis no disponible: no bloquear el acceso.
    }
    return true;
  }
}
