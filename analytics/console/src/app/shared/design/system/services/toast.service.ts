import { Injectable, signal } from '@angular/core';

/** Tone of a toast — matches the `ds-toast` atom (neutral | success | warning | danger | info). */
export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
/** Where the toast appears — DECLARED per page (default top-right). */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  source?: string;
}

/**
 * DsToastService — the toast channel: a small QUEUE where every toast SHOWS and
 * AUTO-DISMISSES after a few seconds. Its POSITION is declared per page (default
 * top-right). Pages that own errors use the banner; here live the transient,
 * non-blocking messages (by convention `success`), plus any page that declares
 * `messages: 'toast'`.
 */
@Injectable({ providedIn: 'root' })
export class DsToastService {
  private readonly _items = signal<ToastItem[]>([]);
  private readonly _position = signal<ToastPosition>('top-right');
  private readonly _duration = signal(4000);
  private nextId = 1;

  readonly items = this._items.asReadonly();
  readonly position = this._position.asReadonly();

  /** Declare (per page) where and how long the toasts appear. */
  configure(opts: { position?: ToastPosition; duration?: number }): void {
    if (opts.position) this._position.set(opts.position);
    if (typeof opts.duration === 'number') this._duration.set(opts.duration);
  }

  /** Show a toast; it auto-dismisses after the declared duration (returns its id). */
  show(tone: ToastTone, message: string, opts?: { source?: string; duration?: number }): number {
    const id = this.nextId++;
    this._items.update((list) => [...list, { id, tone, message, source: opts?.source }]);
    const ms = opts?.duration ?? this._duration();
    if (ms > 0) setTimeout(() => this.dismiss(id), ms);
    return id;
  }

  dismiss(id: number): void {
    this._items.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._items.set([]);
  }
}
