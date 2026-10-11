import { Routes } from '@angular/router';
import { sessionGuard } from './core/session.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [sessionGuard],
    loadComponent: () =>
      import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  { path: '**', redirectTo: '' },
];
