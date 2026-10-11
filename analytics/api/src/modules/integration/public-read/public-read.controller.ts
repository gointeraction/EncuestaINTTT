import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../../../shared/guards/session.guard.js';
import type { SurveySource } from '../../../shared/contracts/index.js';
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
  async listSurveys(): Promise<SurveySource[]> {
    this.accessAudit.registrarLectura('analytics/sources/surveys');
    return this.publicRead.listSurveys();
  }
}
