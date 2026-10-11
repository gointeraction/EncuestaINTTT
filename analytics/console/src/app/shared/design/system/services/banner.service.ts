import { Injectable, signal } from '@angular/core';

export type BannerType = 'error' | 'warning' | 'info' | 'success';
export interface BannerMessage { id: string; type: BannerType; message: string; }

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly _banners = signal<BannerMessage[]>([]);
  readonly banners = this._banners.asReadonly();

  add(type: BannerType, message: string): string {
    const id = crypto.randomUUID();
    this._banners.update(b => [...b, { id, type, message }]);
    return id;
  }

  dismiss(id: string): void {
    this._banners.update(b => b.filter(m => m.id !== id));
  }

  clear(): void { this._banners.set([]); }

  error(message: string): string { return this.add('error', message); }
  warning(message: string): string { return this.add('warning', message); }
  info(message: string): string { return this.add('info', message); }
  success(message: string): string { return this.add('success', message); }
}
