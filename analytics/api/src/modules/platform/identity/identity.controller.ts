import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../../shared/decorators/public.decorator.js';
import { STAFF_SESSION_COOKIE, readStaffSession } from '../../../shared/security/cookies.js';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { AccessAuditService } from '../access-audit/access-audit.service.js';
import { IdentityService } from './identity.service.js';
import { SessionGuard } from './session.guard.js';

interface LoginBody {
  email?: string;
  password?: string;
}
type RequestWithUser = Request & { staffUser?: StaffSessionUser };

@UseGuards(SessionGuard)
@Controller('auth/staff')
export class IdentityController {
  constructor(
    private readonly identity: IdentityService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginBody, @Res({ passthrough: true }) res: Response) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password) throw new UnauthorizedException('Credenciales inválidas');

    const result = await this.identity.login(email, password);
    if (!result) throw new UnauthorizedException('Credenciales inválidas');

    res.cookie(STAFF_SESSION_COOKIE, result.token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return { user: result.user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = readStaffSession(req);
    if (token) await this.identity.logout(token);
    res.clearCookie(STAFF_SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('session')
  async session(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('auth/staff/session', req.staffUser?.id);
    return { user: req.staffUser ?? null };
  }

  @Get('me')
  async me(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('auth/staff/me', req.staffUser?.id);
    return { user: req.staffUser ?? null };
  }
}
