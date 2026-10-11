import { Component, signal } from '@angular/core';
import { DsContainerComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { ConsoleLayoutComponent } from './shared/layouts/console-layout/console-layout.component';

@Component({
  imports: [DsContainerComponent, DsFabComponent, ConsoleLayoutComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('console');
}
