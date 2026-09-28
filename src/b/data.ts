import { median } from "d3-array";
import { loadJson } from "../shared/load.ts";
import { applyMode, type Mode } from "../shared/metric.ts";
import type { Indicator, SeriesData } from "../shared/types.ts";

export const loadB = () => loadJson<SeriesData>("data/b.json");

export const DEFAULT_IND = "A4103";

/** [年][都道府県] の値。人口あたりの分母は同じ年度の総人口。 */
export function seriesOf(data: SeriesData, ind: Indicator, mode: Mode): (number | null)[][] {
  const den = ind.rate ? data.values[ind.rate.den] : undefined;
  return data.values[ind.code]!.map((row, y) => applyMode(ind, mode, row, den?.[y]));
}

/** 全国行がないので、47都道府県の中央値を基準線にする。 */
export function medians(table: (number | null)[][]): (number | null)[] {
  return table.map((row) => median(row.filter((v): v is number => v !== null)) ?? null);
}

export const byArea = (table: (number | null)[][], a: number) => table.map((row) => row[a] ?? null);
