import { Routes } from '@angular/router';
import { sessionGuard } from '../../core/session.guard';

/** Rutas locales del módulo `auth`: acceso (público) y bienvenida (post-login). */
export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'welcome',
    canActivate: [sessionGuard],
    loadComponent: () => import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
];
