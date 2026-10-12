import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
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

  /** Filtros opcionales (JSON en `?filters=`) para exportar solo la SELECCIÓN. */
  private parseFilters(raw?: string): { conditions: Array<{ questionId: string; values: string[] }>; combinator: 'and' | 'or' } {
    if (!raw) return { conditions: [], combinator: 'and' };
    try {
      const j = JSON.parse(raw) as { conditions?: unknown; combinator?: unknown };
      const conditions = Array.isArray(j?.conditions)
        ? (j.conditions as Array<{ questionId: string; values: string[] }>)
        : [];
      return { conditions, combinator: j?.combinator === 'or' ? 'or' : 'and' };
    } catch {
      return { conditions: [], combinator: 'and' };
    }
  }

  /** Datos recolectados (una fila por entrevista). PII enmascarada para no-admin. */
  @Get(':id/export')
  async exportSurvey(
    @Param('id') id: string,
    @Query('filters') filters: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const mask = (req.staffUser?.role ?? 'analista') !== 'admin';
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/export`, req.staffUser?.id);

    await this.prisma.surveyExport.create({
      data: { surveyId: id, actorId: req.staffUser?.id ?? null },
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="datos-${id}.csv"`);
    const f = this.parseFilters(filters);
    for await (const chunk of this.exportService.collectedCsvChunks(id, mask, f.conditions, f.combinator)) {
      res.write(chunk);
    }
    res.end();
  }

  /** Datos recolectados en CSV LARGO (tidy): 1 fila por encuesta × pregunta. */
  @Get(':id/export-long')
  async exportLong(@Param('id') id: string, @Query('filters') filters: string, @Req() req: RequestWithUser, @Res() res: Response): Promise<void> {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/export-long`, req.staffUser?.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="datos-largo-${id}.csv"`);
    const f = this.parseFilters(filters);
    for await (const chunk of this.exportService.collectedLongCsvChunks(id, f.conditions, f.combinator)) res.write(chunk);
    res.end();
  }

  /** Datos CRUDOS en JSONL (NDJSON): el JSON tal como se importa (1 objeto por línea). */
  @Get(':id/export-raw')
  async exportRaw(@Param('id') id: string, @Query('filters') filters: string, @Req() req: RequestWithUser, @Res() res: Response): Promise<void> {
    const mask = (req.staffUser?.role ?? 'analista') !== 'admin';
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/export-raw`, req.staffUser?.id);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="datos-crudo-${id}.ndjson"`);
    const f = this.parseFilters(filters);
    for await (const chunk of this.exportService.collectedRawJsonlChunks(id, mask, f.conditions, f.combinator)) res.write(chunk);
    res.end();
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
