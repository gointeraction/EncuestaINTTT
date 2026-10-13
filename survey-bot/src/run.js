// ============================================================================
// Runner: reproduce N registros del dataset del seed (uno por encuesta),
// con concurrencia, métricas y código de salida.
// ============================================================================
import { chromium } from "playwright";
import { loadConfig } from "./config.js";
import { loadRecords } from "./dataset.js";
import { runOneSurvey } from "./flow.js";

async function main() {
  const cfg = loadConfig();
  const all = loadRecords(cfg.dataset);
  const slice = all.slice(cfg.offset, cfg.offset + cfg.count);
  console.log(
    `survey-bot → ${cfg.baseUrl} · dataset=${cfg.dataset} (${all.length} registros) · reproduciendo ${slice.length} [offset ${cfg.offset}] · concurrency=${cfg.concurrency}`,
  );

  const browser = await chromium.launch({ headless: cfg.headless });
  const results = [];
  let next = 0;

  async function worker(id) {
    for (;;) {
      const i = next++;
      if (i >= slice.length) return;
      const record = slice[i];
      const context = await browser.newContext({ locale: "es-VE" });
      const page = await context.newPage();
      try {
        const r = await runOneSurvey(page, cfg, record);
        results.push({ ok: true, ms: r.ms, duplicate: !!r.duplicate });
        const tag = r.duplicate ? "duplicado (ya existía)" : "enviada";
        console.log(`✓ ${i + 1}/${slice.length} ${record.driverType}/${record.id} ${tag} (${r.ms} ms) [w${id}]`);
      } catch (e) {
        results.push({ ok: false });
        console.error(`✗ ${i + 1}/${slice.length} ${record.driverType}/${record.id}: ${e?.message || e} [w${id}]`);
      } finally {
        await context.close().catch(() => {});
      }
    }
  }

  const workers = Math.min(cfg.concurrency, slice.length || 1);
  await Promise.all(Array.from({ length: workers }, (_, i) => worker(i + 1)));
  await browser.close();

  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const times = results.filter((r) => r.ok).map((r) => r.ms).sort((a, b) => a - b);
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const p95 = times.length ? times[Math.min(times.length - 1, Math.floor(times.length * 0.95))] : 0;
  console.log(`\nResumen: ${ok} OK · ${fail} fallidas · avg ${avg} ms · p95 ${p95} ms`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
