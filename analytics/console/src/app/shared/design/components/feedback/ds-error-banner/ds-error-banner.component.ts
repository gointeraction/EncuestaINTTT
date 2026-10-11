import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DsPageBannerService } from '../../../system/services/ds-page-banner.service';

@Component({
  selector: 'ds-error-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: flex; flex-direction: column; width: 100%;' },
  template: `
    @for (err of bannerSvc.errors(); track err.id) {
      <div class="ds-error-banner__item" [class.ds-error-banner__item--warning]="err.severity === 'warning'">
        <span class="ds-error-banner__icon" aria-hidden="true">
          @if (err.severity === 'warning') {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          } @else {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
        </span>
        <span class="ds-error-banner__message">{{ err.message }}</span>
        @if (err.source) {
          <code class="ds-error-banner__source">{{ err.source }}</code>
        }
        <button type="button" class="ds-error-banner__dismiss" (click)="bannerSvc.dismissError(err.id)" [attr.aria-label]="'Dismiss: ' + err.message">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    }
  `,
  styles: [`
    .ds-error-banner__item {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 10px 14px; font-size: 12.5px; line-height: 1.4;
      background: var(--ds-bg-field); color: var(--ds-color-state-danger);
      border: 1px solid var(--ds-color-state-danger, color-mix(in oklab, var(--ds-color-black) 20%, transparent));
      border-radius: var(--ds-radius-standard);
      margin-bottom: 0.5rem;
    }
    .ds-error-banner__item:last-child { margin-bottom: 0; }
    .ds-error-banner__item--warning {
      color: var(--ds-color-state-warning);
      border-color: var(--ds-color-state-warning, color-mix(in oklab, var(--ds-color-black) 20%, transparent));
    }
    .ds-error-banner__icon { flex-shrink: 0; display: flex; align-items: center; opacity: 0.85; }
    .ds-error-banner__message { flex: 1; font-weight: 500; min-width: 0; }
    .ds-error-banner__source {
      flex-shrink: 0; font-size: 10px; padding: 1px 6px; border-radius: 4px;
      background: color-mix(in srgb, var(--ds-color-state-danger) 12%, transparent);
      color: var(--ds-color-state-danger); opacity: 0.85; white-space: nowrap;
    }
    .ds-error-banner__dismiss {
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 4px;
      background: transparent; cursor: pointer; opacity: 0.5;
      color: inherit; padding: 0; transition: opacity 120ms;
    }
    .ds-error-banner__dismiss:hover { opacity: 1; background: var(--ds-bg-button-dimmed); }
  `],
})
export class DsErrorBannerComponent {
  protected readonly bannerSvc = inject(DsPageBannerService);
}