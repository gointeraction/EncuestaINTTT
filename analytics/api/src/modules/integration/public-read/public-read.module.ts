import { Module } from '@nestjs/common';
import { IdentityModule } from '../../platform/identity/identity.module.js';
import { PublicReadController } from './public-read.controller.js';
import { PublicReadService } from './public-read.service.js';
import { PublicReadPrismaAdapter } from './public-read.prisma.adapter.js';
import { PUBLIC_READ_PORT } from './public-read.port.js';

@Module({
  imports: [IdentityModule],
  controllers: [PublicReadController],
  providers: [
    PublicReadService,
    { provide: PUBLIC_READ_PORT, useClass: PublicReadPrismaAdapter },
  ],
})
export class PublicReadModule {}
