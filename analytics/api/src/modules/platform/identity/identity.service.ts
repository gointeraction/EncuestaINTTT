import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { hashPassword, verifyPassword } from '../../../shared/security/password.js';
import { generateSessionToken, hashSessionToken } from '../../../shared/security/session-token.js';
import type { StaffSessionUser } from '../../../shared/contracts/index.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 h

/**
 * IdentityService — sesión LOCAL de staff (sin IdP externo por ahora), preparada
 * para federar (Passport) más adelante. Persiste en el esquema `analytics`.
 */
@Injectable()
export class IdentityService implements OnModuleInit {
  private readonly logger = new Logger(IdentityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSeedAdmin();
  }

  private async ensureSeedAdmin(): Promise<void> {
    const existing = await this.prisma.staffUser.count();
    if (existing > 0) return;
    const email = (process.env.STAFF_ADMIN_EMAIL ?? 'admin@intt.gob.ve').toLowerCase();
    const password = process.env.STAFF_ADMIN_PASSWORD ?? 'VisionCero2026!';
    const role = await this.prisma.staffRole.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin', permissions: ['*'] },
    });
    await this.prisma.staffUser.create({
      data: { email, passwordHash: hashPassword(password), roleId: role.id },
    });
    this.logger.log(`Seeded staff admin: ${email}`);
  }

  async login(email: string, password: string): Promise<{ token: string; user: StaffSessionUser } | null> {
    const user = await this.prisma.staffUser.findUnique({ where: { email } });
    if (!user || user.status !== 'active' || !verifyPassword(password, user.passwordHash)) {
      return null;
    }
    const role = await this.prisma.staffRole.findUnique({ where: { id: user.roleId } });
    const token = generateSessionToken();
    await this.prisma.staffSession.create({
      data: {
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
    return { token, user: this.toSessionUser(user, role?.name, role?.permissions) };
  }

  async resolveSession(token: string): Promise<StaffSessionUser | null> {
    const session = await this.prisma.staffSession.findFirst({
      where: { tokenHash: hashSessionToken(token), expiresAt: { gt: new Date() } },
    });
    if (!session) return null;
    const user = await this.prisma.staffUser.findUnique({ where: { id: session.userId } });
    if (!user || user.status !== 'active') return null;
    const role = await this.prisma.staffRole.findUnique({ where: { id: user.roleId } });
    return this.toSessionUser(user, role?.name, role?.permissions);
  }

  async logout(token: string): Promise<void> {
    await this.prisma.staffSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  }

  private toSessionUser(
    user: { id: string; email: string },
    role?: string | null,
    permissions?: string[] | null,
  ): StaffSessionUser {
    return { id: user.id, email: user.email, role: role ?? 'analista', permissions: permissions ?? [] };
  }

  private async ensureRole(name: string, permissions: string[]) {
    return this.prisma.staffRole.upsert({
      where: { name },
      update: {},
      create: { name, permissions },
    });
  }

  /** Registro de staff → estado `pending` (requiere aprobación de un administrador). */
  async registerStaff(input: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ ok: true } | { ok: false; reason: 'exists' }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.staffUser.findUnique({ where: { email } });
    if (existing) return { ok: false, reason: 'exists' };
    const role = await this.ensureRole('analista', ['analytics:read']);
    await this.prisma.staffUser.create({
      data: {
        email,
        name: input.name?.trim() || null,
        passwordHash: hashPassword(input.password),
        roleId: role.id,
        status: 'pending',
      },
    });
    return { ok: true };
  }

  /** Solicitud de cambio de contraseña (genérica: no revela si el correo existe). */
  async requestPasswordReset(emailRaw: string): Promise<void> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.staffUser.findUnique({ where: { email } });
    if (!user || user.status !== 'active') return;
    const pending = await this.prisma.passwordResetRequest.findFirst({
      where: { email, status: 'pending' },
    });
    if (pending) return;
    await this.prisma.passwordResetRequest.create({ data: { email, status: 'pending' } });
  }

  /** ¿El correo tiene una solicitud de cambio APROBADA (puede definir nueva clave)? */
  async hasApprovedReset(emailRaw: string): Promise<boolean> {
    const email = emailRaw.trim().toLowerCase();
    const found = await this.prisma.passwordResetRequest.findFirst({
      where: { email, status: 'approved' },
    });
    return !!found;
  }

  /** Define la nueva contraseña si hay una solicitud aprobada (y la marca usada). */
  async resetPassword(emailRaw: string, newPassword: string): Promise<boolean> {
    const email = emailRaw.trim().toLowerCase();
    const request = await this.prisma.passwordResetRequest.findFirst({
      where: { email, status: 'approved' },
      orderBy: { createdAt: 'desc' },
    });
    if (!request) return false;
    const user = await this.prisma.staffUser.findUnique({ where: { email } });
    if (!user) return false;
    await this.prisma.staffUser.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    });
    await this.prisma.passwordResetRequest.update({
      where: { id: request.id },
      data: { status: 'used', resolvedAt: new Date() },
    });
    return true;
  }

  // ─── administración de cuentas ─────────────────────────────────────────────

  async listUsers(status?: string) {
    const users = await this.prisma.staffUser.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
    const roles = await this.prisma.staffRole.findMany();
    const roleName = new Map(roles.map((r) => [r.id, r.name]));
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: roleName.get(u.roleId) ?? 'analista',
      status: u.status,
      createdAt: u.createdAt,
    }));
  }

  async setUserStatus(id: string, status: string, byId?: string): Promise<boolean> {
    if (!['active', 'blocked', 'rejected', 'pending'].includes(status)) return false;
    await this.prisma.staffUser.update({
      where: { id },
      data: {
        status,
        approvedBy: byId ?? null,
        approvedAt: status === 'active' ? new Date() : null,
      },
    });
    return true;
  }

  async setUserRole(id: string, roleName: string): Promise<boolean> {
    const permissions = roleName === 'admin' ? ['*'] : ['analytics:read'];
    const role = await this.ensureRole(roleName, permissions);
    await this.prisma.staffUser.update({ where: { id }, data: { roleId: role.id } });
    return true;
  }

  listPasswordRequests(status?: string) {
    return this.prisma.passwordResetRequest.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolvePasswordRequest(
    id: string,
    status: 'approved' | 'rejected',
    byId?: string,
  ): Promise<boolean> {
    if (!['approved', 'rejected'].includes(status)) return false;
    await this.prisma.passwordResetRequest.update({
      where: { id },
      data: { status, resolvedBy: byId ?? null, resolvedAt: new Date() },
    });
    return true;
  }
}
