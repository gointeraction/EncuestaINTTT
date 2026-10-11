import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

  @Get('surveys/:id/dashboard')
  async survey(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura(`analytics/surveys/${id}/dashboard`, req.staffUser?.id);
    return this.reporting.surveyDashboard(id);
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
