import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PgService } from '../core/pg.service.js';
import { DRIVER_TYPES, SURVEY } from '../core/survey-data.js';

export interface CreateSurveyInput {
  driverType: string;
  answers: Record<string, unknown>;
  clientSubmissionId?: string;
  channel?: string;
  deviceId?: string;
  participaSorteo?: boolean;
  nombre?: string;
  cedula?: string;
  telefono?: string;
  codigoSorteo?: string;
}

export interface CreateSurveyResult {
  status: number;
  body: unknown;
}

/**
 * ResponseCommand — alta de UNA encuesta a la vez para PRUEBAS. NO escribe directo:
 * **reenvía el envío a la captura real** (`/api/survey/submit`) con `channel: "seed"`,
 * así recorre los MISMOS pasos (validación server-side + sorteo + idempotencia); el canal
 * `seed` solo se salta el anti-bot (exige el secreto interno `x-seed-secret`).
 */
@Injectable()
export class ResponseCommand {
  private readonly log = new Logger('response');

  constructor(private readonly pg: PgService) {}

  /** Definición del cuestionario (tipos de conductor + secciones/preguntas). */
  questionnaire(): unknown {
    return {
      title: SURVEY.title,
      subtitle: SURVEY.subtitle,
      driverTypes: DRIVER_TYPES.map((d) => ({ id: d.id, label: d.label })),
      sections: SURVEY.sections.map((s) => ({
        id: s.id,
        title: s.title,
        appliesTo: s.appliesTo,
        questions: s.questions.map((q) => ({
          id: q.id,
          label: q.text,
          type: q.type,
          options: q.options ?? null,
          appliesTo: q.appliesTo,
          showIf: q.showIf ?? null,
          scaleMin: q.scaleMin ?? null,
          scaleMax: q.scaleMax ?? null,
        })),
      })),
    };
  }

  /** Envía una encuesta a la captura como si viniera de un survey real (canal `seed`). */
  async create(input: CreateSurveyInput): Promise<CreateSurveyResult> {
    const base = process.env.CAPTURE_BASE_URL ?? 'http://app:3001';
    const secret = process.env.SEED_SUBMIT_SECRET ?? '';

    const payload = {
      driverType: input.driverType,
      answers: input.answers ?? {},
      sorteo: input.participaSorteo
        ? {
            participa: true,
            nombre: input.nombre,
            cedula: input.cedula,
            telefono: input.telefono,
          }
        : { participa: false },
      clientSubmissionId: input.clientSubmissionId?.trim() || randomUUID(),
      channel: 'seed',
      surveyVersion: 1,
    };

    const res = await fetch(`${base}/api/survey/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-seed-secret': secret },
      body: JSON.stringify(payload),
    });
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = { error: 'Respuesta no JSON de la captura.' };
    }
    this.log.log(`submit ${res.status} (${input.driverType})`);
    return { status: res.status, body };
  }

  /** Quita la encuesta con ese `clientSubmissionId`. Devuelve cuántas filas borró. */
  async remove(clientSubmissionId: string): Promise<number> {
    const rows = await this.pg.query<{ n: number }>(
      `delete from public.legacy_survey_responses where client_submission_id = $1 returning 1 as n`,
      [clientSubmissionId],
    );
    return rows.length;
  }
}
