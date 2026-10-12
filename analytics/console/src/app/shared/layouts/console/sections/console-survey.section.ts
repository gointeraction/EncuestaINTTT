import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveSurveyService } from '../../../../core/active-survey.service';

/**
 * Layout section (header right): selector de la ENCUESTA ACTIVA. Con una sola encuesta
 * muestra su nombre; con varias, un `<select>`.
 */
@Component({
  selector: 'app-console-survey-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (active.surveys().length > 1) {
      <label class="cs">
        <span class="cs__lbl">Encuesta</span>
        <select
          class="cs__sel"
          [value]="active.activeId()"
          (change)="active.setActive($any($event.target).value)"
        >
          @for (s of active.surveys(); track s.id) {
            <option [value]="s.id">{{ s.title }}</option>
          }
        </select>
      </label>
    } @else if (active.active(); as a) {
      <span class="cs__one">Encuesta: <b>{{ a.title }}</b></span>
    }
  `,
  styles: `
    .cs { display: flex; align-items: center; gap: var(--ds-space-2); }
    .cs__lbl { font-size: var(--ds-text-caption); opacity: 0.85; }
    .cs__sel {
      padding: 2px var(--ds-space-2);
      border-radius: var(--ds-radius-md);
      border: 1px solid color-mix(in srgb, var(--ds-color-white) 40%, transparent);
      background: color-mix(in srgb, var(--ds-color-white) 12%, transparent);
      color: var(--ds-color-white);
      font-family: inherit;
      font-size: var(--ds-text-small);
    }
    .cs__sel option { color: var(--ds-color-black); }
    .cs__one { font-size: var(--ds-text-small); opacity: 0.9; }
    .cs__one b { font-weight: 600; }
  `,
})
export class ConsoleSurveySection {
  protected readonly active = inject(ActiveSurveyService);
}
