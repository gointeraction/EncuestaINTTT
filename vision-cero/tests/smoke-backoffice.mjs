#!/usr/bin/env node
/**
 * Smoke test del back-office analítico (EncuestaINTTT) + consola.
 * Ejecuta contra el API a través del proxy de la consola.
 *   node tests/smoke-backoffice.mjs            # por defecto http://localhost:4301/api
 *   API=http://localhost:3151 node tests/smoke-backoffice.mjs
 * Requiere el stack arriba (docker compose up -d --build).
 */

const API = (process.env.API ?? 'http://localhost:4301/api').replace(/\/$/, '');
const CONSOLE = API.replace(/\/api$/, '');
const EMAIL = process.env.STAFF_EMAIL ?? 'admin@intt.gob.ve';
const PASSWORD = process.env.STAFF_PASSWORD ?? 'StaffAdmin2026!';

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`PASS  ${name}${detail ? '  — ' + detail : ''}`);
    passed++;
  } catch (err) {
    console.log(`FAIL  ${name}  — ${err.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  let cookie = '';
  const withCookie = (path, init = {}) =>
    fetch(`${API}${path}`, { ...init, headers: { ...(init.headers ?? {}), cookie } });

  await check('GET /health {db,redis}', async () => {
    const r = await fetch(`${API}/health`);
    assert(r.ok, `status ${r.status}`);
    const j = await r.json();
    assert(j.db === true && j.redis === true, `db=${j.db} redis=${j.redis}`);
    return `db=${j.db} redis=${j.redis}`;
  });

  await check('POST /auth/staff/login (admin)', async () => {
    const r = await fetch(`${API}/auth/staff/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    assert(r.status === 201, `status ${r.status}`);
    cookie = (r.headers.get('set-cookie') ?? '').split(';')[0];
    assert(cookie.startsWith('staff_session='), 'sin cookie de sesión');
    return cookie.slice(0, 24) + '…';
  });

  await check('GET /auth/staff/session (con cookie)', async () => {
    const r = await withCookie('/auth/staff/session');
    assert(r.status === 200, `status ${r.status}`);
    const j = await r.json();
    assert(j.user?.role === 'admin', `rol ${j.user?.role}`);
    return `rol=${j.user.role}`;
  });

  await check('GET /analytics/sources/surveys', async () => {
    const r = await withCookie('/analytics/sources/surveys');
    assert(r.status === 200, `status ${r.status}`);
    const j = await r.json();
    assert(Array.isArray(j), 'no es un arreglo');
    return `${j.length} encuestas`;
  });

  await check('POST /analytics/jobs/summarize', async () => {
    const r = await withCookie('/analytics/jobs/summarize', { method: 'POST' });
    assert(r.status === 201, `status ${r.status}`);
    const j = await r.json();
    assert(j.status === 'done', `estado ${j.status}`);
    return `records=${j.records}`;
  });

  await check('GET /analytics/global/dashboard', async () => {
    const r = await withCookie('/analytics/global/dashboard');
    assert(r.status === 200, `status ${r.status}`);
    const j = await r.json();
    assert(typeof j.totalResponses === 'number', 'sin totalResponses');
    return `totalResponses=${j.totalResponses}`;
  });

  await check('GET /analytics/participants (paginado)', async () => {
    const r = await withCookie('/analytics/participants?page=1&limit=5');
    assert(r.status === 200, `status ${r.status}`);
    const j = await r.json();
    assert(Array.isArray(j.items) && typeof j.total === 'number', 'sin envelope');
    return `total=${j.total} page=${j.page}/${j.totalPages}`;
  });

  await check('GET /analytics/surveys/:id/cross-tab', async () => {
    const r = await withCookie(
      '/analytics/surveys/00000000-0000-0000-0000-000000000000/cross-tab?q1=a&q2=b',
    );
    assert(r.status === 200, `status ${r.status}`);
    const j = await r.json();
    assert(Array.isArray(j.cells), 'sin cells');
    return `cells=${j.cells.length}`;
  });

  await check('GET /analytics/surveys/:id/export (CSV)', async () => {
    const r = await withCookie(
      '/analytics/surveys/00000000-0000-0000-0000-000000000000/export',
    );
    assert(r.status === 200, `status ${r.status}`);
    const ct = r.headers.get('content-type') ?? '';
    assert(ct.includes('text/csv'), `content-type ${ct}`);
    return ct;
  });

  await check('GET /analytics/... sin sesión -> 401', async () => {
    const r = await fetch(`${API}/analytics/global/dashboard`);
    assert(r.status === 401, `status ${r.status}`);
    return '401';
  });

  for (const route of ['/bienvenida', '/analitica', '/analitica/panel', '/analitica/reportes-cruzados', '/analitica/participantes', '/login']) {
    await check(`CONSOLA ${route} -> 200 (SPA)`, async () => {
      const r = await fetch(`${CONSOLE}${route}`);
      assert(r.status === 200, `status ${r.status}`);
      return '200';
    });
  }

  await check('RATE-LIMIT: 11 intentos malos -> 429 (último)', async () => {
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const r = await fetch(`${API}/auth/staff/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: 'incorrecta' }),
      });
      last = r.status;
    }
    assert(last === 429, `último status ${last}`);
    return '429';
  });

  console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
