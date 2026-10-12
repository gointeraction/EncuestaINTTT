import { Routes } from '@angular/router';

/** Rutas del módulo `test-data` (gestión de datos de prueba · SOLO development). */
export const TEST_DATA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/test-data/test-data.page').then((m) => m.TestDataPage),
  },
];
