import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EncuestaINTTTBackOfficeAnalíticoService } from '../../../../../../shared/api-sdk';
import type { GlobalPayload } from '../models/global.model';

/** Único contacto con el backend de esta página: el api-sdk. */
@Injectable({ providedIn: 'root' })
export class GlobalDataService {
  private readonly api = inject(EncuestaINTTTBackOfficeAnalíticoService);

  async loadGlobal(): Promise<GlobalPayload | null> {
    const res = await firstValueFrom(this.api.reportingControllerGlobal());
    return (res as unknown as GlobalPayload) ?? null;
  }

  async summarize(): Promise<unknown> {
    return firstValueFrom(this.api.summarizationControllerSummarize());
  }
}
