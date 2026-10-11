import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../shared/api-sdk';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h1>Consola analítica</h1>
    <p>Usuario: {{ session.user()?.email }} — rol {{ session.user()?.role }}</p>
    <button type="button" (click)="load()">Cargar fuentes</button>
    <pre>{{ fuentes() | json }}</pre>
    <button type="button" (click)="logout()">Salir</button>
  `,
})
export class DashboardComponent {
  readonly session = inject(SessionService);
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);
  readonly fuentes = signal<unknown>(null);

  async load(): Promise<void> {
    this.fuentes.set(await firstValueFrom(this.api.publicReadControllerListSurveys()));
  }

  async logout(): Promise<void> {
    await this.session.logout();
  }
}
