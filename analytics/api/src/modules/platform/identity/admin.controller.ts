import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { AccessAuditService } from '../access-audit/access-audit.service.js';
import { AdminGuard } from './admin.guard.js';
import { IdentityService } from './identity.service.js';
import { SessionGuard } from './session.guard.js';

type RequestWithUser = Request & { staffUser?: StaffSessionUser };
interface UserPatchBody {
  status?: string;
  roleName?: string;
}
interface RequestPatchBody {
  status?: 'approved' | 'rejected';
}

/**
 * Administración de cuentas de staff (solo rol admin): aprobar registros, resolver
 * solicitudes de cambio de contraseña y bloquear/desbloquear usuarios.
 */
@ApiTags('admin')
@UseGuards(SessionGuard, AdminGuard)
@Controller('admin')
export class AdminUsersController {
  constructor(
    private readonly identity: IdentityService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @Get('users')
  async users(@Query('status') status: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('admin/users', req.staffUser?.id);
    return { users: await this.identity.listUsers(status || undefined) };
  }

  @Patch('users/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { status: { type: 'string' }, roleName: { type: 'string' } },
    },
  })
  async patchUser(
    @Param('id') id: string,
    @Body() body: UserPatchBody,
    @Req() req: RequestWithUser,
  ) {
    await this.accessAudit.registrarLectura('admin/users/:id', req.staffUser?.id);
    if (body?.status) await this.identity.setUserStatus(id, body.status, req.staffUser?.id);
    if (body?.roleName) await this.identity.setUserRole(id, body.roleName);
    return { ok: true };
  }

  @Get('password-requests')
  async passwordRequests(@Query('status') status: string, @Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('admin/password-requests', req.staffUser?.id);
    return { requests: await this.identity.listPasswordRequests(status || undefined) };
  }

  @Patch('password-requests/:id')
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string' } } } })
  async patchRequest(
    @Param('id') id: string,
    @Body() body: RequestPatchBody,
    @Req() req: RequestWithUser,
  ) {
    await this.accessAudit.registrarLectura('admin/password-requests/:id', req.staffUser?.id);
    if (!body?.status) return { ok: false };
    const ok = await this.identity.resolvePasswordRequest(id, body.status, req.staffUser?.id);
    return { ok };
  }
}
