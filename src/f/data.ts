import { loadJson } from "../shared/load.ts";
import { quantileScale, type ColorScale } from "../shared/scales.ts";
import { num } from "../shared/format.ts";
import type { ClimateData } from "../shared/types.ts";
import { jmaRainMonthly, jmaSunMonthly } from "./jma.ts";

export const loadF = () => loadJson<ClimateData>("data/f.json");

export const YEAR = 12;
export const MONTHS = Array.from({ length: 12 }, (_, i) => i);

/** 月の値に使う色。降水量と日照時間だけは気象庁の配色指針に合わせる。 */
export function monthlyScale(data: ClimateData, code: string): ColorScale {
  if (code === "CN500") return jmaRainMonthly();
  if (code === "CN400") return jmaSunMonthly();
  const all = data.values[code]!.flatMap((row) => row.slice(0, 12));
  return quantileScale(all, (v) => num(v, Math.abs(v) < 100 ? 1 : 0));
}

export const periodLabel = (p: string) => (p === "年" ? "年間" : `${p}月`);
