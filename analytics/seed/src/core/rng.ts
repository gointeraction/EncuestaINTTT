/** RNG determinista (mulberry32): misma semilla → misma secuencia. Reproducible. */
export class Rng {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  float(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min: number, max: number): number {
    return min + Math.floor(this.float() * (max - min + 1));
  }

  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.float() * arr.length)];
  }

  weighted<T>(entries: ReadonlyArray<readonly [T, number]>): T {
    const total = entries.reduce((a, [, w]) => a + w, 0);
    let r = this.float() * total;
    for (const [v, w] of entries) {
      if ((r -= w) <= 0) return v;
    }
    return entries[entries.length - 1][0];
  }
}

/** RNG estable por fila: independiente del orden de generación (permite streaming). */
export function rowRng(base: number, ...parts: number[]): Rng {
  let h = base >>> 0;
  for (const p of parts) {
    h = (Math.imul(h ^ (p >>> 0), 2654435761) >>> 0) ^ 0x9e3779b9;
  }
  return new Rng(h);
}
