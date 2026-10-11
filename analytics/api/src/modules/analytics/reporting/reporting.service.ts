import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

/** ReportingService — lee los read models (solo lectura) para los paneles. */
@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async surveyDashboard(surveyId: string): Promise<unknown | null> {
    const row = await this.prisma.surveySummaryReport.findUnique({ where: { surveyId } });
    return row ? JSON.parse(row.summaryData) : null;
  }

  async globalDashboard(): Promise<unknown | null> {
    const row = await this.prisma.globalDashboard.findUnique({ where: { id: 'latest' } });
    return row ? JSON.parse(row.payload) : null;
  }
}
