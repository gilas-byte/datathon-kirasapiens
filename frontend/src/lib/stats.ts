import type { HistSal } from "./tipos";

/** Mediana recomposta do histograma (interpolação linear dentro da faixa; faixas de R$ 10 até R$ 4 mil, erro < R$ 10). */
export function medianaHist(h: HistSal[]): number | null {
  const porFaixa = new Map<number, { hi: number; n: number }>();
  let total = 0;
  for (const r of h) {
    const a = porFaixa.get(r.lo);
    porFaixa.set(r.lo, { hi: r.hi, n: (a?.n ?? 0) + r.n });
    total += r.n;
  }
  if (!total) return null;
  let acum = 0;
  for (const [lo, { hi, n }] of [...porFaixa.entries()].sort((a, b) => a[0] - b[0])) {
    if (acum + n >= total / 2) return lo + ((total / 2 - acum) / n) * (hi - lo);
    acum += n;
  }
  return null;
}
