import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PgService } from '../core/pg.service.js';
import { SURVEY_ID } from '../core/vision-cero.js';
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
  id: string;
  duplicate: boolean;
  clientSubmissionId: string;
}

/**
 * ResponseCommand — alta de UNA encuesta a la vez (datos de prueba) con la MISMA
 * idempotencia que la captura real: `client_submission_id` es único, así que reenviar
 * la misma encuesta NO la duplica (devuelve `duplicate: true`).
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

  /** Inserta una encuesta; si el `clientSubmissionId` ya existe → no la duplica. */
  async create(input: CreateSurveyInput): Promise<CreateSurveyResult> {
    const clientSubmissionId = input.clientSubmissionId?.trim() || randomUUID();

    const existing = await this.pg.query<{ id: string }>(
      `select id from public.legacy_survey_responses where client_submission_id = $1 limit 1`,
      [clientSubmissionId],
    );
    if (existing.length) {
      this.log.log(`duplicada (idempotencia): ${clientSubmissionId}`);
      return { id: existing[0].id, duplicate: true, clientSubmissionId };
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const participa = !!input.participaSorteo;
    await this.pg.run(
      `insert into public.legacy_survey_responses
         ("id","driverType","answers","capturedAt","completedAt","participaSorteo","nombre","cedula","telefono","codigoSorteo","channel","device_id","client_submission_id","survey_version","survey_id")
       values ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10,$11,$12,1,$13)`,
      [
        id,
        input.driverType,
        JSON.stringify(input.answers ?? {}),
        now,
        participa,
        participa ? input.nombre ?? null : null,
        participa ? input.cedula ?? null : null,
        participa ? input.telefono ?? null : null,
        participa ? input.codigoSorteo ?? `COD-${id.slice(0, 6)}` : null,
        input.channel ?? 'public',
        input.deviceId ?? null,
        clientSubmissionId,
        SURVEY_ID,
      ],
    );
    this.log.log(`encuesta creada ${id} (${input.driverType})`);
    return { id, duplicate: false, clientSubmissionId };
  }
}
