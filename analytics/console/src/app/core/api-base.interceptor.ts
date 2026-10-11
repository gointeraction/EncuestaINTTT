import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE } from './api.config';

/** Prefija el back-office a las rutas relativas del api-sdk y envía la cookie de sesión. */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  // `/seed` es el seeder (dev-only), proxado aparte por nginx; no lleva el prefijo `/api`.
  if (req.url.startsWith('/') && !req.url.startsWith('//') && !req.url.startsWith('/seed')) {
    return next(req.clone({ url: API_BASE + req.url, withCredentials: true }));
  }
  return next(req);
};
