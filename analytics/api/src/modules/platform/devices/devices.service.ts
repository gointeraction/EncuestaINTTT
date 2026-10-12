import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../core/prisma/prisma.service.js';

export interface DeviceInput {
  name: string;
  channel: string;
  dailyQuota?: number;
}

/** Gestión de DISPOSITIVOS de captura (kioscos y encuestadores) sobre `public.capture_devices`. */
@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  private slug(name: string): string {
    return (
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'dispositivo'
    );
  }

  /** Dispositivos + nº de cuestionarios (total y hoy). */
  async list(): Promise<unknown[]> {
    const devices = await this.prisma.$queryRawUnsafe<
      Array<{ id: string; name: string; channel: string; dailyQuota: number; active: boolean }>
    >(
      `SELECT id, name, channel, daily_quota AS "dailyQuota", active
       FROM public.capture_devices ORDER BY channel, id`,
    );
    const counts = await this.prisma.$queryRawUnsafe<Array<{ id: string; total: number; today: number }>>(
      `SELECT device_id AS id, COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE COALESCE("capturedAt", "completedAt")::date = now()::date)::int AS today
       FROM public.legacy_survey_responses WHERE device_id IS NOT NULL GROUP BY 1`,
    );
    const byId = new Map(counts.map((c) => [c.id, c]));
    return devices.map((d) => ({
      ...d,
      total: byId.get(d.id)?.total ?? 0,
      today: byId.get(d.id)?.today ?? 0,
    }));
  }

  /** Alta: genera el id (slug) y una clave (secret) nueva. */
  async create(input: DeviceInput): Promise<{ id: string; secret: string }> {
    if (!input?.name || !['kiosk', 'surveyor'].includes(input.channel)) {
      throw new BadRequestException('Nombre y canal (kiosk|surveyor) requeridos');
    }
    const base = this.slug(input.name);
    let id = base;
    let n = 1;
    while (
      (await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id FROM public.capture_devices WHERE id = $1`,
        id,
      )).length > 0
    ) {
      id = `${base}-${++n}`;
    }
    const secret = randomBytes(24).toString('hex');
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.capture_devices (id, name, channel, secret, daily_quota, active)
       VALUES ($1, $2, $3, $4, $5, true)`,
      id,
      input.name.trim(),
      input.channel,
      secret,
      Math.max(1, Math.floor(input.dailyQuota ?? 500)),
    );
    return { id, secret };
  }

  /** Edita nombre / cuota / activo. */
  async update(id: string, input: { name?: string; dailyQuota?: number; active?: boolean }): Promise<boolean> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (typeof input.name === 'string') {
      params.push(input.name.trim());
      sets.push(`name = $${params.length}`);
    }
    if (typeof input.dailyQuota === 'number') {
      params.push(Math.max(1, Math.floor(input.dailyQuota)));
      sets.push(`daily_quota = $${params.length}`);
    }
    if (typeof input.active === 'boolean') {
      params.push(input.active);
      sets.push(`active = $${params.length}`);
    }
    if (sets.length === 0) return false;
    params.push(id);
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.capture_devices SET ${sets.join(', ')} WHERE id = $${params.length}`,
      ...params,
    );
    return true;
  }

  /** Regenera la clave del dispositivo y la devuelve (única vez). */
  async regenerateSecret(id: string): Promise<string> {
    const secret = randomBytes(24).toString('hex');
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.capture_devices SET secret = $2 WHERE id = $1`,
      id,
      secret,
    );
    return secret;
  }
}
