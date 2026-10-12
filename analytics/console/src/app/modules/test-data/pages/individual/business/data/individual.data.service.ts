import { Injectable, inject } from '@angular/core';
import { DevSeedClient } from '../../../../../../core/dev-seed.client';
import type { QuestionnaireDef, SubmitResult } from '../models/individual.model';

/** Contacto con el seeder para la encuesta individual. */
@Injectable({ providedIn: 'root' })
export class IndividualDataService {
  private readonly client = inject(DevSeedClient);

  async questionnaire(): Promise<QuestionnaireDef | null> {
    return (await this.client.questionnaire()) as QuestionnaireDef;
  }

  /** Envía a la captura real (canal `seed`); captura también las respuestas de error. */
  async create(payload: unknown): Promise<SubmitResult> {
    try {
      const body = await this.client.createSurvey(payload);
      return { ok: true, status: 201, body: (body as Record<string, unknown>) ?? {} };
    } catch (err) {
      const e = err as { status?: number; error?: unknown };
      const body =
        e.error && typeof e.error === 'object' ? (e.error as Record<string, unknown>) : {};
      return { ok: false, status: e.status ?? 0, body };
    }
  }

  async remove(clientSubmissionId: string): Promise<number> {
    const res = await this.client.removeSurvey(clientSubmissionId);
    return res?.removed ?? 0;
  }
}
