import { Global, Module } from '@nestjs/common';
import { AccessAuditService } from './access-audit.service.js';

@Global()
@Module({
  providers: [AccessAuditService],
  exports: [AccessAuditService],
})
export class AccessAuditModule {}
