import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsContainerComponent } from '@cifraflow/design';
import { DsFabComponent } from '@cifraflow/fab';
import { ShellHeaderComponent } from './core/shell-header/shell-header.component';

@Component({
  imports: [RouterOutlet, DsContainerComponent, DsFabComponent, ShellHeaderComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('console');
}
