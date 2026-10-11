import { InjectionToken, signal, type Signal } from '@angular/core';

/** Where a page's data comes from: the api-sdk (real) or the page's business mock. */
export type DataOrigin = 'api' | 'mock';

/**
 * DATA_SOURCE_SERVICE — optional seam (like LANGUAGE_SERVICE / DESIGN_SYSTEM_SERVICE) for the
 * GLOBAL data origin. The design system never assumes a backend: the app provides the service,
 * the design tools (FAB) expose it, and every page's `business/data/*.data.service.ts` reads it
 * to pick between the api-sdk and its own `*.mock.data.ts`.
 */
export interface IDataSourceService {
  readonly origin: Signal<DataOrigin>;
  setOrigin(origin: DataOrigin): void;
  toggle(): void;
}

export const DATA_SOURCE_SERVICE = new InjectionToken<IDataSourceService>('DATA_SOURCE_SERVICE');

/** No-op default — the origin toggle is hidden when no service is provided. */
export class NoopDataSourceService implements IDataSourceService {
  readonly origin = signal<DataOrigin>('mock');
  setOrigin(_origin: DataOrigin): void {}
  toggle(): void {}
}
