import { Module } from '@nestjs/common';
import { IdentityModule } from '../../platform/identity/identity.module.js';
import { ExportService } from './export.service.js';
import { ExportController } from './export.controller.js';

@Module({
  imports: [IdentityModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
