import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { SessionGuard } from '../../platform/identity/session.guard.js';
import { AccessAuditService } from '../../platform/access-audit/access-audit.service.js';
import { SummarizationService } from './summarization.service.js';

type RequestWithUser = Request & { staffUser?: StaffSessionUser };

@ApiTags('analytics')
@UseGuards(SessionGuard)
@Controller('analytics/jobs')
export class SummarizationController {
  constructor(
    private readonly summarization: SummarizationService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @Post('summarize')
  summarize() {
    return this.summarization.run('all');
  }

  @Get('summarize/status')
  async status(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('analytics/jobs/summarize/status', req.staffUser?.id);
    return this.summarization.status();
  }
}
