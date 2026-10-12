import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { AdminGuard } from '../identity/admin.guard.js';
import { SessionGuard } from '../identity/session.guard.js';
import { AccessAuditService } from '../access-audit/access-audit.service.js';
import { DevicesService, type DeviceInput } from './devices.service.js';

type RequestWithUser = Request & { staffUser?: StaffSessionUser };

/** Administración de DISPOSITIVOS de captura (solo rol admin). */
@ApiTags('admin')
@UseGuards(SessionGuard, AdminGuard)
@Controller('admin/devices')
export class DevicesController {
  constructor(
    private readonly devices: DevicesService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @Get()
  async list(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('admin/devices', req.staffUser?.id);
    return { devices: await this.devices.list() };
  }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'channel'],
      properties: {
        name: { type: 'string' },
        channel: { type: 'string', enum: ['kiosk', 'surveyor'] },
        dailyQuota: { type: 'number' },
      },
    },
  })
  async create(@Body() body: DeviceInput, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('admin/devices', req.staffUser?.id);
    return this.devices.create(body);
  }

  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        dailyQuota: { type: 'number' },
        active: { type: 'boolean' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; dailyQuota?: number; active?: boolean },
    @Req() req: RequestWithUser,
  ) {
    await this.accessAudit.registrarLectura('admin/devices/:id', req.staffUser?.id);
    return { ok: await this.devices.update(id, body) };
  }

  @Post(':id/secret')
  async regenerateSecret(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('admin/devices/:id/secret', req.staffUser?.id);
    return { secret: await this.devices.regenerateSecret(id) };
  }
}
