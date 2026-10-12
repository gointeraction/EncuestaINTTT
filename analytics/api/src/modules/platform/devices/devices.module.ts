import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { DevicesController } from './devices.controller.js';
import { DevicesService } from './devices.service.js';

@Module({
  imports: [IdentityModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
