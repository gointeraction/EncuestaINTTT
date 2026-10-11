import { Injectable, signal, computed } from '@angular/core';

export type NetworkStatus = 'online' | 'offline';

@Injectable({ providedIn: 'root' })
export class NetworkStateService {
  private readonly _status = signal<NetworkStatus>(navigator.onLine ? 'online' : 'offline');

  readonly status   = this._status.asReadonly();
  readonly isOnline = computed(() => this._status() === 'online');

  constructor() {
    window.addEventListener('offline', () => this._status.set('offline'));
    window.addEventListener('online', () => this._status.set('online'));
  }
}
