import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EnvironmentService } from './environment.service';

/** Permite la ruta SOLO en local/development; en cualquier otro entorno redirige a la home. */
export const devOnlyGuard: CanActivateFn = async () => {
  const env = inject(EnvironmentService);
  const router = inject(Router);
  if (!env.loaded()) await env.load();
  return env.isDevelopment() ? true : router.createUrlTree(['/']);
};
