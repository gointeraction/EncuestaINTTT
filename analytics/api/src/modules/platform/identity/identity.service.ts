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
}
