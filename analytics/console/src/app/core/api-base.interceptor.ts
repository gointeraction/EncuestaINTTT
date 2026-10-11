import { HttpInterceptorFn } from '@angular/common/http';
import { API_BASE } from './api.config';

/** Prefija el back-office a las rutas relativas del api-sdk y envía la cookie de sesión. */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/') && !req.url.startsWith('//')) {
    return next(req.clone({ url: API_BASE + req.url, withCredentials: true }));
  }
  return next(req);
};
