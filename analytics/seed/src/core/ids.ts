/** Ids deterministas (UUID v4 válidos) derivados de índices — reproducibles entre tablas. */
export function detUuid(...parts: number[]): string {
  let x = 0x9e3779b97f4a7c15n;
  for (const p of parts) {
    x ^= BigInt(p >>> 0);
    x = BigInt.asUintN(64, x * 0xbf58476d1ce4e5b9n);
    x ^= x >> 27n;
  }
  const y = x ^ 0xc2b2ae3d27d4eb4fn;
  const bytes: number[] = [];
  for (let i = 0; i < 16; i++) {
    bytes.push(Number(((i < 8 ? x : y) >> BigInt(8 * (7 - (i % 8)))) & 0xffn));
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const h = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}
