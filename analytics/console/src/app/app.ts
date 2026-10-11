import { Component, signal } from '@angular/core';
import { ConsoleLayout } from './shared/layouts/console/console.layout';

@Component({
  imports: [ConsoleLayout],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('console');
}
