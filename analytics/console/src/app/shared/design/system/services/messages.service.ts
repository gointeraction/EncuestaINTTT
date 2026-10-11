import { Injectable, effect, inject } from '@angular/core';
import { ThemeService } from './theme.service';
import { DsPageBannerService } from './ds-page-banner.service';
import { DsToastService, type ToastPosition } from './toast.service';

export type MessageTone = 'info' | 'success' | 'warning' | 'error';
/** The message surface a page DECLARES for its non-success messages. */
export type MessageSurface = 'toast' | 'banner';

interface PageMessagesMeta {
  messages?: MessageSurface;
  toast?: { position?: ToastPosition; duration?: number };
}

/**
 * DsMessagesService — the message BUS. Producers (the FAB, the GlobalErrorHandler,
 * the backend interceptor) call `emit()`; the bus ROUTES by the CURRENT page's
 * DECLARATION (`ThemeService.pageMetadata().messages`):
 *   - `error` | `warning` | `info` → the declared surface (`banner` | `toast`);
 *   - `success` → ALWAYS the toast (a banner does not justify it).
 * It is NOT a fixed rule: the page decides and declares, intentionally.
 */
@Injectable({ providedIn: 'root' })
export class DsMessagesService {
  private readonly theme = inject(ThemeService);
  private readonly banner = inject(DsPageBannerService);
  private readonly toast = inject(DsToastService);

  constructor() {
    // Apply the page's declared toast position/duration when the page changes.
    effect(() => {
      const md = this.theme.pageMetadata() as PageMessagesMeta | null;
      if (md?.toast) this.toast.configure(md.toast);
    });
  }

  private surface(): MessageSurface {
    const md = this.theme.pageMetadata() as PageMessagesMeta | null;
    return md?.messages ?? 'toast';
  }

  emit(tone: MessageTone, message: string, source?: string): void {
    if (tone === 'success') {
      this.toast.show('success', message, { source });
      return;
    }
    if (this.surface() === 'banner') {
      if (tone === 'info') this.banner.addNotification(message, source);
      else this.banner.addError(message, source, tone);
    } else {
      this.toast.show(tone === 'error' ? 'danger' : tone, message, { source });
    }
  }
}
