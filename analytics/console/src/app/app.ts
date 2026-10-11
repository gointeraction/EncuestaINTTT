import { Component, signal } from '@angular/core';
import { ConsoleLayoutComponent } from './shared/layouts/console-layout/console-layout.component';

@Component({
  imports: [ConsoleLayoutComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('console');
}
