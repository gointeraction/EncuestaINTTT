import { Component, inject, signal } from '@angular/core';
import { DsContainerComponent, DsHeaderComponent, DsPageTitleComponent } from '@cifraflow/design';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../shared/api-sdk';

interface Participant {
  id: string;
  nombre: string | null;
  cedula: string | null;
  telefono: string | null;
  codigo: string | null;
  momento: string | null;
}
interface Page {
  items: Participant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [DsContainerComponent, DsHeaderComponent, DsPageTitleComponent],
  template: `
    <ds-container kind="page" name="participantes">
      <ds-container kind="area" name="header">
        <ds-header>
          <div class="ds-h__row">
            <div class="ds-h__section ds-h__section--grow">
              <ds-page-title title="Participantes del sorteo" subtitle="Analítica · INTT" [showBack]="false" />
            </div>
          </div>
        </ds-header>
      </ds-container>

      <ds-container kind="area" name="body">
        <ds-container kind="section" name="lista">
          @if (page(); as p) {
            <p>{{ p.total }} participantes (página {{ p.page }} de {{ p.totalPages }})</p>
            <table>
              <thead><tr><th>Nombre</th><th>Cédula</th><th>Teléfono</th><th>Código</th></tr></thead>
              <tbody>
                @for (i of p.items; track i.id) {
                  <tr><td>{{ i.nombre }}</td><td>{{ i.cedula }}</td><td>{{ i.telefono }}</td><td>{{ i.codigo }}</td></tr>
                }
              </tbody>
            </table>
            <p>
              <button type="button" [disabled]="p.page <= 1" (click)="go(p.page - 1)">Anterior</button>
              <button type="button" [disabled]="p.page >= p.totalPages" (click)="go(p.page + 1)">Siguiente</button>
            </p>
          } @else {
            <p>Sin datos.</p>
          }
        </ds-container>
      </ds-container>
    </ds-container>
  `,
})
export class ParticipantesComponent {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);
  readonly page = signal<Page | null>(null);

  constructor() {
    void this.load(1);
  }

  async load(p: number): Promise<void> {
    const r = await firstValueFrom(
      this.api.reportingControllerParticipants({ page: String(p), limit: '20' }),
    );
    this.page.set((r as unknown as Page) ?? null);
  }

  go(p: number): void {
    void this.load(p);
  }
}
