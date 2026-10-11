import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
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

  @Get('global/dashboard')
  async global(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('analytics/global/dashboard', req.staffUser?.id);
    return this.reporting.globalDashboard();
  }
}
