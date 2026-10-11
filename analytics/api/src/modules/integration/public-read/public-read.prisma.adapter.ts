import { Injectable } from '@nestjs/common';
import type { SurveySource } from '../../../shared/contracts/index.js';
import { QUESTIONNAIRES } from '../../analytics/read-model/questionnaires.js';
import type { PublicReadPort } from './public-read.port.js';

/**
 * PublicReadPrismaAdapter — lectura (solo lectura) de las FUENTES de análisis.
 * Las fuentes se derivan del REGISTRO de cuestionarios (A2: questionnaires-registry.md):
 * hoy Visión Cero (documental JSON en `public.legacy_survey_responses`); el motor SDD
 * (normalizado) es la fuente alternativa.
 */
@Injectable()
export class PublicReadPrismaAdapter implements PublicReadPort {
  async listSurveys(): Promise<SurveySource[]> {
    return QUESTIONNAIRES.map((q) => ({
      id: q.id,
      title: q.title,
      slug: q.id,
      status: 'published',
    }));
  }
}
