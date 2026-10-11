import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DsToastService } from '../../system';
import { DsToastComponent } from './toast/toast.component';

/**
 * ds-toast-host — renders the DsToastService queue at the DECLARED position
 * (default top-right) using the `ds-toast` atom. Each toast shows and
 * auto-dismisses (the service owns the timing). Mount it ONCE in the shell;
 * pages declare position/duration via DsToastService.configure().
 */
@Component({
  selector: 'ds-toast-host',
  standalone: true,
  imports: [DsToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <div class="ds-toast-host"
           [class.is-top-right]="position() === 'top-right'"
           [class.is-top-left]="position() === 'top-left'"
           [class.is-bottom-right]="position() === 'bottom-right'"
           [class.is-bottom-left]="position() === 'bottom-left'">
        @for (t of items(); track t.id) {
          <ds-toast [tone]="t.tone" class="ds-toast-host__item" (click)="dismiss(t.id)">{{ t.message }}</ds-toast>
        }
      </div>
    }
  `,
  styles: `
    .ds-toast-host { position: fixed; z-index: var(--ds-z-toast); display: flex; flex-direction: column; gap: var(--ds-space-2); pointer-events: none; }
    .ds-toast-host.is-top-right { top: var(--ds-space-4); right: var(--ds-space-4); align-items: flex-end; }
    .ds-toast-host.is-top-left { top: var(--ds-space-4); left: var(--ds-space-4); align-items: flex-start; }
    .ds-toast-host.is-bottom-right { bottom: var(--ds-space-4); right: var(--ds-space-4); align-items: flex-end; }
    .ds-toast-host.is-bottom-left { bottom: var(--ds-space-4); left: var(--ds-space-4); align-items: flex-start; }
    .ds-toast-host__item { pointer-events: auto; cursor: pointer; }
  `,
})
export class DsToastHostComponent {
  private readonly toast = inject(DsToastService);
  protected readonly items = this.toast.items;
  protected readonly position = this.toast.position;
  protected dismiss(id: number): void {
    this.toast.dismiss(id);
  }
}
