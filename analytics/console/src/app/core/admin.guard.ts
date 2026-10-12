import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

/** Exige rol administrador (o permiso `*`); si no, redirige a la bienvenida. */
export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  const user = session.user();
  if (user && (user.role === 'admin' || user.permissions?.includes('*'))) return true;
  return router.createUrlTree(['/bienvenida']);
};
