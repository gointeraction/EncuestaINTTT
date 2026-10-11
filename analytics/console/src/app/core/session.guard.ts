import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

/** Exige sesión de staff; si no la hay, redirige a /login. */
export const sessionGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (!session.loaded()) {
    await session.refresh();
  }
  if (session.user()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
