import { Routes } from '@angular/router';

/** Rutas del área CONSTRUCTOR de encuestas. El guard de sesión + rol `admin` los
 *  aplica el área en `app.routes.ts`. */
export const BUILDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/builder/builder.page').then((m) => m.BuilderPage),
  },
];
