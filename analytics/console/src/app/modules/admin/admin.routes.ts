import { Routes } from '@angular/router';

/** Rutas del área de administración (roles/usuarios/solicitudes). El guard de sesión +
 *  rol `admin` los aplica el área en `app.routes.ts`. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
  },
  {
    path: 'devices',
    loadComponent: () => import('./pages/devices/devices.page').then((m) => m.DevicesPage),
  },
];
