import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import type { SurveySource } from '../../../shared/contracts/index.js';
import type { PublicReadPort } from './public-read.port.js';

interface SurveyRow {
  id: string;
  title: string;
  slug: string;
  status: string;
}

/**
 * PublicReadPrismaAdapter — lectura de solo lectura sobre el esquema `public`
 * (captura). Usa SQL SELECT; el rol del back-office solo tiene SELECT sobre public.
 */
@Injectable()
export class PublicReadPrismaAdapter implements PublicReadPort {
  constructor(private readonly prisma: PrismaService) {}

  async listSurveys(): Promise<SurveySource[]> {
    const rows = await this.prisma.$queryRaw<SurveyRow[]>`
      SELECT id, title, slug, status::text AS status
      FROM public.surveys
      ORDER BY created_at DESC
      LIMIT 500
    `;
    return rows.map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status }));
  }
}
