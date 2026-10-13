// ============================================================================
// Respuestas genéricas por TIPO de control (sin conocer el cuestionario):
//   radio · checkbox · select (combobox) · número · texto/textarea
// Responde lo VISIBLE en la sección actual; el branching (showIf) se estabiliza
// re-ejecutando unas rondas.
// ============================================================================

/** Responde la sección visible actual. Idempotente (no re-marca lo ya marcado). */
export async function answerVisible(page, { thinkMs = 0 } = {}) {
  const pause = () => page.waitForTimeout(Math.min(thinkMs, 800));

  // --- Radios: un grupo por [role="radiogroup"]; marcar el primero si ninguno está marcado ---
  for (const group of await page.locator('[role="radiogroup"]').all()) {
    if (!(await group.isVisible().catch(() => false))) continue;
    const selected = await group.locator('[role="radio"][aria-checked="true"]').count();
    if (!selected) {
      await group.getByRole("radio").first().click().catch(() => {});
      await pause();
    }
  }

  // --- Checkboxes: marcar UNA por grupo (agrupando por el contenedor de opciones) ---
  const firstOfGroup = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('[role="checkbox"]')];
    const seen = new Set();
    const out = [];
    boxes.forEach((cb, i) => {
      if (!cb.offsetParent) return; // no visible
      const container = cb.closest("label")?.parentElement || cb.parentElement;
      if (container && !seen.has(container)) {
        seen.add(container);
        out.push(i);
      }
    });
    return out;
  });
  const allCheckboxes = page.getByRole("checkbox");
  for (const i of firstOfGroup) {
    const cb = allCheckboxes.nth(i);
    const checked = await cb.getAttribute("aria-checked").catch(() => null);
    if (checked !== "true") {
      await cb.click().catch(() => {});
      await pause();
    }
  }

  // --- Selects (Radix combobox): abrir y elegir la primera opción si está vacío/placeholder ---
  for (const cb of await page.getByRole("combobox").all()) {
    if (!(await cb.isVisible().catch(() => false))) continue;
    const txt = ((await cb.textContent()) || "").trim();
    if (txt === "" || /selecciona|seleccione|elegir|primero elige|sin municipios/i.test(txt)) {
      await cb.click().catch(() => {});
      await page.getByRole("option").first().click().catch(() => {});
      await pause();
    }
  }

  // --- Números: rellenar dentro de min/max si está vacío ---
  for (const el of await page.locator('input[type="number"]:visible').all()) {
    if (await el.inputValue()) continue;
    const min = Number(await el.getAttribute("min"));
    const max = Number(await el.getAttribute("max"));
    let v = 25;
    if (Number.isFinite(min) && v < min) v = min;
    if (Number.isFinite(max) && v > max) v = max;
    await el.fill(String(v)).catch(() => {});
    await pause();
  }

  // --- Texto / textarea: rellenar si está vacío ---
  for (const el of await page.locator('input[type="text"]:visible, textarea:visible').all()) {
    if (await el.inputValue()) continue;
    await el.fill("Prueba INTT").catch(() => {});
    await pause();
  }
}

/** Responde reiteradamente hasta estabilizar la sección (branching). */
export async function answerStable(page, cfg, rounds = 3) {
  for (let i = 0; i < rounds; i++) await answerVisible(page, cfg);
}
