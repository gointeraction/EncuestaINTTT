import { Injectable, computed, signal } from '@angular/core';

export type BannerSeverity = 'error' | 'warning' | 'info';

export interface BannerMessage {
  id: string;
  message: string;
  source?: string;
  severity: BannerSeverity;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class DsPageBannerService {
  private readonly _errors = signal<BannerMessage[]>([]);
  private readonly _notifications = signal<BannerMessage[]>([]);

  readonly errors = this._errors.asReadonly();
  readonly notifications = this._notifications.asReadonly();
  readonly hasError = computed(() => this._errors().length > 0);
  readonly hasNotification = computed(() => this._notifications().length > 0);
  readonly firstError = computed(() => this._errors()[0] ?? null);
  readonly firstNotification = computed(() => this._notifications()[0] ?? null);

  addError(message: string, source?: string, severity: BannerSeverity = 'error'): string {
    const id = this._generateId();
    this._errors.update(list => [...list, { id, message, source, severity, timestamp: new Date() }]);
    return id;
  }

  dismissError(id: string): void {
    this._errors.update(list => list.filter(e => e.id !== id));
  }

  clearErrors(): void {
    this._errors.set([]);
  }

  addNotification(message: string, source?: string): string {
    const id = this._generateId();
    this._notifications.update(list => [...list, { id, message, source, severity: 'info' as const, timestamp: new Date() }]);
    return id;
  }

  dismissNotification(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  clearNotifications(): void {
    this._notifications.set([]);
  }

  clearAll(): void {
    this._errors.set([]);
    this._notifications.set([]);
  }

  private _generateId(): string {
    return `banner_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
}