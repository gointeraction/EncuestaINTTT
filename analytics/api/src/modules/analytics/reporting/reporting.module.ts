import { Module } from '@nestjs/common';
import { IdentityModule } from '../../platform/identity/identity.module.js';
import { ReadModelModule } from '../read-model/read-model.module.js';
import { ReportingService } from './reporting.service.js';
import { ReportingController } from './reporting.controller.js';

@Module({
  imports: [IdentityModule, ReadModelModule],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
