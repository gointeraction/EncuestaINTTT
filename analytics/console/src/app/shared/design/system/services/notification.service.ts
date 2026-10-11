import { Injectable, signal } from '@angular/core';

export type DsNotificationTone = 'info' | 'warning' | 'error' | 'success';

export interface DsNotification {
  id: number;
  tone: DsNotificationTone;
  message: string;
}

/**
 * DsNotificationService — design-system-wide notification channel (fake-driven by
 * the FAB for now). Root-scoped singleton, token-driven, dumb: emits + clears only.
 * The header notification section of a page can subscribe to active() and render.
 */
@Injectable({ providedIn: 'root' })
export class DsNotificationService {
  private readonly _active = signal<DsNotification | null>(null);
  private nextId = 1;

  /** Current notification (null = invisible by default). */
  readonly active = this._active.asReadonly();

  notify(tone: DsNotificationTone, message: string): void {
    this._active.set({ id: this.nextId++, tone, message });
  }

  clear(): void {
    this._active.set(null);
  }
}