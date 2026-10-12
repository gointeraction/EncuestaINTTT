import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { SessionGuard } from '../../platform/identity/session.guard.js';
import { AccessAuditService } from '../../platform/access-audit/access-audit.service.js';
import { ExportService } from './export.service.js';

type RequestWithUser = Request & { staffUser?: StaffSessionUser };

@ApiTags('analytics')
@UseGuards(SessionGuard)
@Controller('analytics/surveys')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly prisma: PrismaService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  /** Datos recolectados (una fila por entrevista). PII enmascarada para no-admin. */
  @Get(':id/export')
  async exportSurvey(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const mask = (req.staffUser?.role ?? 'analista') !== 'admin';
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/export`, req.staffUser?.id);

    const csv = await this.exportService.generateCollectedCsv(id, mask);
    await this.prisma.surveyExport.create({
      data: { surveyId: id, actorId: req.staffUser?.id ?? null },
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="datos-${id}.csv"`);
    res.send(csv);
  }

  /** Definición del cuestionario (catálogo de preguntas). */
  @Get(':id/questionnaire')
  async exportQuestionnaire(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/questionnaire`, req.staffUser?.id);
    const csv = this.exportService.generateQuestionnaireCsv(id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cuestionario-${id}.csv"`);
    res.send(csv);
  }
}
