import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * App — the application root. Renders the top-level `<router-outlet/>` (a LAYOUT).
 * Inline per the pack (no .html/.css side files).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<router-outlet />',
  styles: `
    :host { display: block; height: 100dvh; }
  `,
})
export class App {}
