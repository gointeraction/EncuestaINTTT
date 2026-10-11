import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DsPageBannerService } from '../../../system/services/ds-page-banner.service';

@Component({
  selector: 'ds-notification-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; flex-direction: column; width: 100%;' },
  template: `
    @for (notif of bannerSvc.notifications(); track notif.id) {
      <div class="ds-notification-banner__item">
        <span class="ds-notification-banner__pulse" aria-hidden="true">
          <span class="ds-notification-banner__pulse-ring"></span>
          <span class="ds-notification-banner__pulse-dot"></span>
        </span>
        <span class="ds-notification-banner__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
        </span>
        <span class="ds-notification-banner__message">{{ notif.message }}</span>
        @if (notif.source) {
          <code class="ds-notification-banner__source">{{ notif.source }}</code>
        }
        <button type="button" class="ds-notification-banner__dismiss" (click)="bannerSvc.dismissNotification(notif.id)" [attr.aria-label]="'Dismiss: ' + notif.message">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    .ds-notification-banner__item {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 10px 14px; font-size: 12.5px; line-height: 1.4;
      background: var(--ds-bg-field); color: var(--ds-color-brand-primary);
      border: 1px solid var(--ds-border-subtle);
      border-radius: var(--ds-radius-standard);
      margin-bottom: 0.5rem;
    }
    .ds-notification-banner__item:last-child { margin-bottom: 0; }
    .ds-notification-banner__pulse {
      flex-shrink: 0; position: relative; width: 10px; height: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .ds-notification-banner__pulse-ring {
      position: absolute; inset: 0; border-radius: 50%;
      background: var(--ds-color-state-success); opacity: 0.4;
      animation: ds-pulse 1.8s ease-in-out infinite;
    }
    .ds-notification-banner__pulse-dot {
      position: relative; width: 6px; height: 6px; border-radius: 50%;
      background: var(--ds-color-state-success);
    }
    @keyframes ds-pulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.8); opacity: 0; }
    }
    .ds-notification-banner__icon { flex-shrink: 0; display: flex; align-items: center; opacity: 0.75; }
    .ds-notification-banner__message { flex: 1; font-weight: 500; min-width: 0; }
    .ds-notification-banner__source {
      flex-shrink: 0; font-size: 10px; padding: 1px 6px; border-radius: 4px;
      background: var(--ds-bg-button-dimmed); color: var(--ds-text-muted);
      opacity: 0.85; white-space: nowrap;
    }
    .ds-notification-banner__dismiss {
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 4px;
      background: transparent; cursor: pointer; opacity: 0.5;
      color: inherit; padding: 0; transition: opacity 120ms;
    }
    .ds-notification-banner__dismiss:hover { opacity: 1; background: var(--ds-bg-button-dimmed); }
  `],
})
export class DsNotificationBannerComponent {
  protected readonly bannerSvc = inject(DsPageBannerService);
}