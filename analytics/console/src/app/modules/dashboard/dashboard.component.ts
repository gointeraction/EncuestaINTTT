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

    <p>
      <button type="button" (click)="loadSources()">Fuentes</button>
      <button type="button" (click)="loadGlobal()">Panel global</button>
      <button type="button" (click)="summarize()">Recalcular sumarización</button>
      <button type="button" (click)="logout()">Salir</button>
    </p>

    @if (run(); as r) { <p>Corrida: {{ r }}</p> }
    @if (global()) { <h2>Panel global</h2><pre>{{ global() | json }}</pre> }
    @if (fuentes()) { <h2>Fuentes</h2><pre>{{ fuentes() | json }}</pre> }
  `,
})
export class DashboardComponent {
  readonly session = inject(SessionService);
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  readonly global = signal<unknown>(null);
  readonly fuentes = signal<unknown>(null);
  readonly run = signal<string | null>(null);

  async loadSources(): Promise<void> {
    this.fuentes.set(await firstValueFrom(this.api.publicReadControllerListSurveys()));
  }

  async loadGlobal(): Promise<void> {
    this.global.set(await firstValueFrom(this.api.reportingControllerGlobal()));
  }

  async summarize(): Promise<void> {
    const res = await firstValueFrom(this.api.summarizationControllerSummarize());
    this.run.set(JSON.stringify(res));
    await this.loadGlobal();
  }

  async logout(): Promise<void> {
    await this.session.logout();
  }
}
