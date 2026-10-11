import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { SurveySource, StaffSessionUser } from '../../../shared/contracts/index.js';
import { SessionGuard } from '../../platform/identity/session.guard.js';
import { AccessAuditService } from '../../platform/access-audit/access-audit.service.js';
import { PublicReadService } from './public-read.service.js';

@Controller('analytics/sources')
@UseGuards(SessionGuard)
export class PublicReadController {
  constructor(
    private readonly publicRead: PublicReadService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @Get('surveys')
  async listSurveys(
    @Req() req: Request & { staffUser?: StaffSessionUser },
  ): Promise<SurveySource[]> {
    await this.accessAudit.registrarLectura('analytics/sources/surveys', req.staffUser?.id);
    return this.publicRead.listSurveys();
  }
}
