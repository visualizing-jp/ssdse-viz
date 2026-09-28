import type { Indicator } from "./types.ts";

/** 実数で見るか、人口あたり・割合で見るか。 */
export type Mode = "raw" | "rate";

export const MODES = [
  { value: "raw" as const, label: "実数" },
  { value: "rate" as const, label: "人口あたり・割合" },
];

export function effectiveMode(ind: Indicator, mode: Mode): Mode {
  return mode === "rate" && ind.rate ? "rate" : "raw";
}

export function unitOf(ind: Indicator, mode: Mode): string {
  return effectiveMode(ind, mode) === "rate" ? ind.rate!.unit : ind.unit;
}

/** 見出しに添える「人口10万人あたり」などの説明。実数なら空。 */
export function basisOf(ind: Indicator, mode: Mode): string {
  return effectiveMode(ind, mode) === "rate" ? ind.rate!.label : "";
}

export function ratio(v: number | null, den: number | null, scale: number): number | null {
  if (v === null || den === null || den === 0) return null;
  return (v / den) * scale;
}

/** values と den は同じ並び。rate でないときは values をそのまま返す。 */
export function applyMode(
  ind: Indicator,
  mode: Mode,
  values: (number | null)[],
  den: (number | null)[] | undefined,
): (number | null)[] {
  if (effectiveMode(ind, mode) !== "rate" || den === undefined) return values;
  return values.map((v, i) => ratio(v, den[i] ?? null, ind.rate!.scale));
}
