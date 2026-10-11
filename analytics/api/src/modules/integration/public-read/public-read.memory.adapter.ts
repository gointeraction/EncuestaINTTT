import { Injectable } from '@nestjs/common';
import type { SurveySource } from '../../../shared/contracts/index.js';
import type { PublicReadPort } from './public-read.port.js';

/**
 * PublicReadMemoryAdapter — placeholder de F1. El adaptador real (Prisma de solo
 * lectura sobre `public`, con el rol `intt_analytics_ro`) se incorpora en F1.2.
 */
@Injectable()
export class PublicReadMemoryAdapter implements PublicReadPort {
  async listSurveys(): Promise<SurveySource[]> {
    return [];
  }
}
