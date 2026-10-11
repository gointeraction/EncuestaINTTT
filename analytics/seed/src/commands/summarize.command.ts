import { Inject, Injectable, Logger } from '@nestjs/common';
import { SEED_CONFIG, type SeedConfig } from '../config.js';

/** summarize — dispara la sumarización del back-office (login staff + POST jobs). */
@Injectable()
export class SummarizeCommand {
  private readonly log = new Logger('summarize');

  constructor(@Inject(SEED_CONFIG) private readonly config: SeedConfig) {}

  async run(): Promise<void> {
    const base = this.config.apiBaseUrl;
    this.log.log(`login staff en ${base} …`);
    const login = await fetch(`${base}/auth/staff/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: this.config.staffEmail, password: this.config.staffPassword }),
    });
    if (!login.ok) throw new Error(`login falló: HTTP ${login.status}`);
    const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';

    const res = await fetch(`${base}/analytics/jobs/summarize`, {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) throw new Error(`summarize falló: HTTP ${res.status}`);
    this.log.log(`summarize OK: ${await res.text()}`);
  }
}
