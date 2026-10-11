import { Module } from '@nestjs/common';
import { PublicReadController } from './public-read.controller.js';
import { PublicReadService } from './public-read.service.js';
import { PublicReadMemoryAdapter } from './public-read.memory.adapter.js';
import { PUBLIC_READ_PORT } from './public-read.port.js';
import { AccessAuditService } from '../../platform/access-audit/access-audit.service.js';

@Module({
  controllers: [PublicReadController],
  providers: [
    PublicReadService,
    AccessAuditService,
    { provide: PUBLIC_READ_PORT, useClass: PublicReadMemoryAdapter },
  ],
})
export class PublicReadModule {}
