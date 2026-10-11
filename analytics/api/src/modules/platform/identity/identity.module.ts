import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { SessionGuard } from './session.guard.js';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService, SessionGuard],
  exports: [IdentityService, SessionGuard],
})
export class IdentityModule {}
