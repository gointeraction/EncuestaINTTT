import { PROFILES, type Profile, type ProfileName } from './profiles.js';

export const SEED_CONFIG = 'SEED_CONFIG';

export interface SeedConfig {
  appEnv: string;
  databaseUrl: string;
  apiBaseUrl: string;
  databaseName: string;
  rngSeed: number;
  profileName: string;
  profile: Profile;
  staffEmail: string;
  staffPassword: string;
}

export interface CliFlags {
  command: string;
  profile?: string;
  seed?: string;
}

/** Carga y VALIDA la configuración. Las guardas abortan fuera de development. — MUST */
export function loadConfig(flags: CliFlags): SeedConfig {
  const appEnv = process.env.APP_ENV ?? 'development';
  const seedAllow = process.env.SEED_ALLOW === '1';
  const databaseUrl = process.env.DATABASE_URL ?? '';

  if (!databaseUrl) throw new Error('SEED abortado: falta DATABASE_URL.');
  const databaseName = databaseNameOf(databaseUrl);

  if (appEnv !== 'development') {
    throw new Error(`SEED abortado: APP_ENV="${appEnv}" (solo se permite "development").`);
  }
  if (!seedAllow) {
    throw new Error('SEED abortado: SEED_ALLOW != 1 (el seeder es destructivo; habilítalo solo en dev).');
  }
  if (!/(^|_)dev($|_)/i.test(databaseName)) {
    throw new Error(
      `SEED abortado: la base "${databaseName}" no está en la allowlist de desarrollo (*dev*).`,
    );
  }

  const profileName = flags.profile ?? 'small';
  const profile = PROFILES[profileName as ProfileName];
  if (!profile) {
    throw new Error(
      `Perfil inválido: "${profileName}". Usa uno de: ${Object.keys(PROFILES).join(' | ')}.`,
    );
  }

  return {
    appEnv,
    databaseUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://api:3151',
    databaseName,
    rngSeed: Number(flags.seed ?? 42),
    profileName,
    profile,
    staffEmail: process.env.STAFF_ADMIN_EMAIL ?? 'admin@intt.gob.ve',
    staffPassword: process.env.STAFF_ADMIN_PASSWORD ?? '',
  };
}

function databaseNameOf(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\//, '').split('?')[0];
  } catch {
    return '';
  }
}
