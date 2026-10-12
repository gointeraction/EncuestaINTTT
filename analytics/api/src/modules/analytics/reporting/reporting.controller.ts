import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { SessionGuard } from '../../platform/identity/session.guard.js';
import { AccessAuditService } from '../../platform/access-audit/access-audit.service.js';
import { ReportingService } from './reporting.service.js';

type RequestWithUser = Request & { staffUser?: StaffSessionUser };

@ApiTags('analytics')
@UseGuards(SessionGuard)
@Controller('analytics')
export class ReportingController {
  constructor(
    private readonly reporting: ReportingService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @ApiQuery({ name: 'dimension', required: false })
  @ApiQuery({ name: 'value', required: false })
  @Get('surveys/:id/dashboard')
  async survey(
    @Param('id') id: string,
    @Query('dimension') dimension: string,
    @Query('value') value: string,
    @Req() req: RequestWithUser,
  ) {
    const auditPath = dimension && value
      ? `analytics/surveys/${id}/dashboard?dimension=${dimension}&value=${value}`
      : `analytics/surveys/${id}/dashboard`;
    await this.accessAudit.registrarLectura(auditPath, req.staffUser?.id);
    return this.reporting.surveyDashboard(id, dimension, value);
  }

  @Get('surveys/:id/dimensions')
  async dimensions(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/dimensions`, req.staffUser?.id);
    return this.reporting.dimensions(id);
  }

  @Get('surveys/:id/timeline')
  async timeline(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/timeline`, req.staffUser?.id);
    return this.reporting.timeline(id);
  }

  @Post('surveys/:id/filtered')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        combinator: { type: 'string', enum: ['and', 'or'] },
        conditions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              values: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  async filtered(
    @Param('id') id: string,
    @Body() body: { combinator?: string; conditions?: Array<{ questionId: string; values: string[] }> },
    @Req() req: RequestWithUser,
  ) {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/filtered`, req.staffUser?.id);
    const combinator = body?.combinator === 'or' ? 'or' : 'and';
    return this.reporting.filtered(id, body?.conditions ?? [], combinator);
  }

  @Get('anomalies')
  async anomalies(@Query('survey') survey: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('analytics/anomalies', req.staffUser?.id);
    return this.reporting.anomalies(survey ?? '');
  }

  @Get('surveys/:id/cross-tab')
  async crossTab(
    @Param('id') id: string,
    @Query('q1') q1: string,
    @Query('q2') q2: string,
    @Req() req: RequestWithUser,
  ) {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/cross-tab`, req.staffUser?.id);
    return this.reporting.crossTab(id, q1 ?? '', q2 ?? '');
  }

  @Get('global/dashboard')
  async global(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('analytics/global/dashboard', req.staffUser?.id);
    return this.reporting.globalDashboard();
  }

  @Get('participants')
  async participants(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: RequestWithUser,
  ) {
    const role = req.staffUser?.role ?? 'analista';
    await this.accessAudit.registrarLectura('analytics/participants', req.staffUser?.id);
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    return this.reporting.participants(p, l, role !== 'admin');
  }
}
