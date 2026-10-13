// ============================================================================
// Reproduce UN registro del dataset por la UI (sin improvisar respuestas).
// Maneja el DOM por [data-qid] y por ids de opción `${qid}-${opción}`.
// ============================================================================
import { DRIVER_LABEL } from "./dataset.js";

async function clickFirst(page, locators, timeout = 15000) {
  for (const loc of locators) {
    try {
      const el = loc.first();
      await el.waitFor({ state: "visible", timeout });
      await el.click();
      return true;
    } catch {
      /* siguiente */
    }
  }
  return false;
}

/** Selecciona una opción en un Radix Select (combobox) por texto exacto. */
async function selectCombo(page, trigger, value, thinkMs) {
  if (value == null || value === "") return;
  const current = ((await trigger.textContent().catch(() => "")) || "").trim();
  if (current === String(value)) return;
  await trigger.click().catch(() => {});
  const exact = page.getByRole("option", { name: String(value), exact: true });
  if (await exact.count()) await exact.first().click().catch(() => {});
  else await page.getByRole("option").first().click().catch(() => {}); // fallback
  await page.waitForTimeout(Math.min(thinkMs, 500));
}

/** Aplica el valor del registro al bloque de pregunta `[data-qid]`. */
async function applyQuestion(page, block, qid, answers, thinkMs) {
  const pause = () => page.waitForTimeout(Math.min(thinkMs, 400));

  // Radio
  if (await block.locator('[role="radio"]').count()) {
    const opt = Array.isArray(answers[qid]) ? answers[qid][0] : answers[qid];
    if (opt != null && opt !== "") {
      const item = page.locator(`[id="${qid}-${opt}"]`);
      if (await item.count()) {
        await item.first().click().catch(() => {});
        await pause();
      }
    }
    return;
  }

  // Checkbox (múltiple)
  if (await block.locator('[role="checkbox"]').count()) {
    const vals = Array.isArray(answers[qid]) ? answers[qid] : [answers[qid]];
    for (const v of vals) {
      if (v == null || v === "") continue;
      const item = page.locator(`[id="${qid}-${v}"]`);
      if (await item.count()) {
        const cb = item.first();
        if ((await cb.getAttribute("aria-checked").catch(() => null)) !== "true") {
          await cb.click().catch(() => {});
          await pause();
        }
      }
    }
    return;
  }

  // Selects
  const combos = block.locator('[role="combobox"]');
  const n = await combos.count();
  if (n >= 2) {
    // estado-municipio (dos select: estado, municipio)
    await selectCombo(page, combos.nth(0), answers["estado"], thinkMs);
    await selectCombo(page, combos.nth(1), answers["municipio"], thinkMs);
    return;
  }
  if (n === 1) {
    await selectCombo(page, combos.first(), answers[qid], thinkMs);
    return;
  }

  // Slider (scale): fijar el valor del registro moviéndolo con el teclado
  const slider = block.locator('[role="slider"]');
  if (await slider.count()) {
    let target = Number(answers[qid]);
    if (!Number.isFinite(target)) return; // sin valor en el registro → dejar por defecto
    const min = Number(await slider.first().getAttribute("aria-valuemin"));
    const max = Number(await slider.first().getAttribute("aria-valuemax"));
    const now = Number(await slider.first().getAttribute("aria-valuenow"));
    const cur = Number.isFinite(now) ? now : Number.isFinite(min) ? min : 1;
    if (Number.isFinite(min)) target = Math.max(min, target);
    if (Number.isFinite(max)) target = Math.min(max, target);
    if (target !== cur) {
      await slider.first().focus().catch(() => {});
      const key = target > cur ? "ArrowRight" : "ArrowLeft";
      for (let i = 0; i < Math.abs(target - cur); i++) {
        await page.keyboard.press(key).catch(() => {});
      }
      await pause();
    }
    return;
  }

  // Número
  const num = block.locator('input[type="number"]');
  if (await num.count()) {
    const v = answers[qid];
    if (v != null && v !== "") await num.first().fill(String(v)).catch(() => {});
    return;
  }

  // Texto / textarea
  const txt = block.locator('input[type="text"], textarea');
  if (await txt.count()) {
    const v = answers[qid];
    if (v != null && v !== "") await txt.first().fill(String(v)).catch(() => {});
  }
}

/** Ejecuta UNA encuesta con los datos de `record`. */
export async function runOneSurvey(page, cfg, record) {
  const t0 = Date.now();
  if (process.env.BOT_DEBUG) console.error("record.answers:", JSON.stringify(record.answers));
  await page
    .goto(cfg.baseUrl, { waitUntil: "networkidle", timeout: 45000 })
    .catch(() => page.goto(cfg.baseUrl, { waitUntil: "load", timeout: 45000 }).catch(() => {}));

  // Bienvenida
  if (!(await clickFirst(page, [page.getByRole("button", { name: /Comenzar encuesta/i })]))) {
    throw new Error("no apareció 'Comenzar encuesta'");
  }

  // Perfil (según el registro)
  const label = DRIVER_LABEL[record.driverType] || record.driverType;
  await clickFirst(page, [
    page.getByRole("button", { name: label }),
    page.getByText(label, { exact: false }),
  ]);
  await clickFirst(page, [page.getByRole("button", { name: /Continuar a la encuesta/i })]);

  // Secciones: inyectar los valores del registro
  let reachedSorteo = false;
  for (let guard = 0; guard < 40; guard++) {
    for (const block of await page.locator("[data-qid]").all()) {
      if (!(await block.isVisible().catch(() => false))) continue;
      const qid = await block.getAttribute("data-qid");
      await applyQuestion(page, block, qid, record.answers, cfg.thinkMs);
    }
    const next = page.getByRole("button", { name: /Siguiente|Continuar al sorteo/i }).first();
    const text = ((await next.textContent().catch(() => "")) || "").trim();
    if (process.env.BOT_DEBUG) {
      const sec = await page.getByText(/Sección\s+\d+\s+de/i).first().textContent().catch(() => "");
      console.error(`   · ${(sec || "").trim() || "(sin sección)"} | next="${text}"`);
      if (process.env.BOT_DEBUG === "2" && guard === 6) {
        const details = await page.evaluate(() =>
          [...document.querySelectorAll("[data-qid]")]
            .filter((b) => b.offsetParent)
            .map((b) => {
              const q = (s) => b.querySelectorAll(s);
              return {
                qid: b.getAttribute("data-qid"),
                radio: `${q('[role="radio"][aria-checked="true"]').length}/${q('[role="radio"]').length}`,
                check: `${q('[role="checkbox"][aria-checked="true"]').length}/${q('[role="checkbox"]').length}`,
                combo: [...q('[role="combobox"]')].map((c) => (c.textContent || "").trim().slice(0, 18)),
                slider: q('[role="slider"]').length,
                num: [...q('input[type="number"]')].map((n) => n.value),
                txt: [...q('input[type="text"],textarea')].map((t) => t.value),
              };
            }),
        );
        for (const d of details) console.error("      " + JSON.stringify(d));
      }
    }
    await next.click().catch(() => {});
    await page.waitForTimeout(Math.min(cfg.thinkMs, 500));
    if (/sorteo/i.test(text)) {
      reachedSorteo = true;
      break;
    }
  }
  if (!reachedSorteo) throw new Error("no se alcanzó el sorteo");

  // Sorteo (según el registro)
  if (record.participaSorteo) {
    await clickFirst(page, [
      page.getByRole("switch", { name: /participar/i }),
      page.getByLabel(/participar en el sorteo/i),
    ]);
    const byLabel = [
      [page.getByLabel(/nombre/i), record.nombre],
      [page.getByLabel(/c[eé]dula/i), record.cedula],
      [page.getByLabel(/tel[eé]fono/i), record.telefono],
    ];
    let filled = 0;
    for (const [loc, val] of byLabel) {
      if (!val) continue;
      if (await loc.count().catch(() => 0)) {
        await loc.first().fill(String(val)).catch(() => {});
        filled++;
      }
    }
    if (filled < 3) {
      const fields = await page.locator('input[type="text"]:visible, input[type="tel"]:visible').all();
      const vals = [record.nombre, record.cedula, record.telefono];
      for (let i = 0; i < fields.length && i < vals.length; i++) {
        if (vals[i] && !(await fields[i].inputValue().catch(() => ""))) {
          await fields[i].fill(String(vals[i])).catch(() => {});
        }
      }
    }
    await page.waitForTimeout(300);
  }

  // Esperar el token de Turnstile (en dev la clave de prueba lo emite solo)
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector('input[name="cf-turnstile-response"]');
        return !!el && typeof el.value === "string" && el.value.length > 10;
      },
      null,
      { timeout: 25000 },
    )
    .catch(() => {});

  // Enviar
  if (process.env.BOT_DEBUG) {
    const ts = await page.evaluate(() => ({
      hasTurnstile: typeof window.turnstile !== "undefined",
      tokenLen: (document.querySelector('input[name="cf-turnstile-response"]') || {}).value?.length || 0,
      iframes: document.querySelectorAll('iframe[src*="cloudflare"]').length,
    }));
    console.error("TURNSTILE:", JSON.stringify(ts));
    page.on("response", async (r) => {
      if (r.url().includes("/api/survey/submit")) {
        const body = await r.text().catch(() => "");
        console.error("SUBMIT_RESP", r.status(), body.slice(0, 300));
      }
    });
  }
  let submitStatus = null;
  page.on("response", (r) => {
    if (r.url().includes("/api/survey/submit")) submitStatus = r.status();
  });
  await clickFirst(page, [page.getByRole("button", { name: /Enviar/i })]);

  const thanksRe = "text=/gracias|Gracias por participar|Encuesta enviada|¡Encuesta enviada!|enviada/i";
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    if (await page.locator(thanksRe).count().catch(() => 0)) {
      return { ok: true, submitted: true, ms: Date.now() - t0 };
    }
    if (submitStatus === 409) {
      // Cédula del sorteo ya registrada (p.ej. el dataset ya fue cargado): no es fallo del bot.
      return { ok: true, duplicate: true, ms: Date.now() - t0 };
    }
    if (submitStatus && submitStatus >= 400) {
      throw new Error(`submit HTTP ${submitStatus}`);
    }
    await page.waitForTimeout(300);
  }
  throw new Error("no se confirmó el envío");
}
