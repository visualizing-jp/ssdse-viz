const formatters = new Map<number, Intl.NumberFormat>();
function nf(digits: number): Intl.NumberFormat {
  let f = formatters.get(digits);
  if (f === undefined) {
    f = new Intl.NumberFormat("ja-JP", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    formatters.set(digits, f);
  }
  return f;
}

/** 桁数は値の大きさで決める。整数はそのまま、小さい比率は小数を残す。 */
export function digitsFor(v: number): number {
  if (Number.isInteger(v)) return 0;
  const a = Math.abs(v);
  return a >= 1000 ? 0 : a >= 100 ? 1 : a >= 1 ? 2 : 3;
}

export function num(v: number | null, digits?: number): string {
  if (v === null || !Number.isFinite(v)) return "—";
  return nf(digits ?? digitsFor(v)).format(v);
}

/** 0時からの分 → "7:05"。 */
export function clock(v: number | null): string {
  if (v === null) return "—";
  const m = Math.round(v);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

export function withUnit(v: number | null, unit: string, digits?: number): string {
  if (unit === "時:分") return clock(v);
  const s = num(v, digits);
  if (s === "—" || unit === "") return s;
  return unit === "%" ? `${s}%` : `${s} ${unit}`;
}

/** 都府県を落とした短い名前（北海道はそのまま）。 */
export function short(label: string): string {
  return label === "北海道" ? label : label.replace(/[都府県]$/, "");
}
