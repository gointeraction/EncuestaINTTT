import { Module } from '@nestjs/common';
import { IdentityModule } from '../../platform/identity/identity.module.js';
import { ReportingService } from './reporting.service.js';
import { ReportingController } from './reporting.controller.js';

@Module({
  imports: [IdentityModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
