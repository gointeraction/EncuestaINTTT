import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../../shared/decorators/public.decorator.js';
import { STAFF_SESSION_COOKIE, readStaffSession } from '../../../shared/security/cookies.js';
import { LoginRateLimitGuard } from '../../../shared/guards/login-rate-limit.guard.js';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';
import { AccessAuditService } from '../access-audit/access-audit.service.js';
import { IdentityService } from './identity.service.js';
import { verifyTurnstileToken } from './turnstile.js';
import { SessionGuard } from './session.guard.js';

interface LoginBody {
  email?: string;
  password?: string;
  turnstileToken?: string;
}
interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}
type RequestWithUser = Request & { staffUser?: StaffSessionUser };

const STAFF_USER_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string' },
    permissions: { type: 'array', items: { type: 'string' } },
  },
};

@ApiTags('identity')
@UseGuards(SessionGuard)
@Controller('auth/staff')
export class IdentityController {
  constructor(
    private readonly identity: IdentityService,
    private readonly accessAudit: AccessAuditService,
  ) {}

  @Public()
  @UseGuards(LoginRateLimitGuard)
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        turnstileToken: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({
    schema: { type: 'object', properties: { user: STAFF_USER_SCHEMA } },
  })
  async login(@Body() body: LoginBody, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password) throw new UnauthorizedException('Credenciales inválidas');

    const captchaOk = await verifyTurnstileToken(body?.turnstileToken, req.ip);
    if (!captchaOk) throw new UnauthorizedException('Verificación de seguridad inválida');

    const result = await this.identity.login(email, password);
    if (!result) throw new UnauthorizedException('Credenciales inválidas');

    res.cookie(STAFF_SESSION_COOKIE, result.token, { httpOnly: true, sameSite: 'lax', path: '/' });
    return { user: result.user };
  }

  @Public()
  @UseGuards(LoginRateLimitGuard)
  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  async register(@Body() body: RegisterBody) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || password.length < 8) throw new BadRequestException('Datos de registro inválidos');
    const result = await this.identity.registerStaff({ email, password, name: body?.name });
    if (!result.ok) throw new ConflictException('El correo ya está registrado');
    return { ok: true };
  }

  @Public()
  @UseGuards(LoginRateLimitGuard)
  @Post('password/request')
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
  async passwordRequest(@Body() body: { email?: string }) {
    const email = typeof body?.email === 'string' ? body.email : '';
    if (email) await this.identity.requestPasswordReset(email);
    return { ok: true };
  }

  @Public()
  @Get('password/status')
  async passwordStatus(@Query('email') email: string) {
    const status = email ? await this.identity.passwordResetStatus(email) : 'none';
    return { status };
  }

  @Public()
  @UseGuards(LoginRateLimitGuard)
  @Post('password/reset')
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' }, newPassword: { type: 'string' } } },
  })
  async passwordReset(@Body() body: { email?: string; newPassword?: string }) {
    const email = typeof body?.email === 'string' ? body.email : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
    if (!email || newPassword.length < 8) throw new BadRequestException('Datos inválidos');
    const ok = await this.identity.resetPassword(email, newPassword);
    if (!ok) throw new BadRequestException('No hay una solicitud aprobada para este correo');
    return { ok: true };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = readStaffSession(req);
    if (token) await this.identity.logout(token);
    res.clearCookie(STAFF_SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('session')
  @ApiOkResponse({ schema: { type: 'object', properties: { user: STAFF_USER_SCHEMA } } })
  async session(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('auth/staff/session', req.staffUser?.id);
    return { user: req.staffUser ?? null };
  }

  @Get('me')
  @ApiOkResponse({ schema: { type: 'object', properties: { user: STAFF_USER_SCHEMA } } })
  async me(@Req() req: RequestWithUser) {
    await this.accessAudit.registrarLectura('auth/staff/me', req.staffUser?.id);
    return { user: req.staffUser ?? null };
  }
}
