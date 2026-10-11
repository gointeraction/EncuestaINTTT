import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin.controller.js';
import { AdminGuard } from './admin.guard.js';
import { IdentityController } from './identity.controller.js';
import { IdentityService } from './identity.service.js';
import { SessionGuard } from './session.guard.js';

@Module({
  controllers: [IdentityController, AdminUsersController],
  providers: [IdentityService, SessionGuard, AdminGuard],
  exports: [IdentityService, SessionGuard],
})
export class IdentityModule {}
