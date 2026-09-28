import { loadJson } from "../shared/load.ts";
import type { SnapshotData } from "../shared/types.ts";

export const loadC = () => loadJson<SnapshotData>("data/c.json");

export const DEFAULT_ITEM = "LB031001";
export const NATIONAL = 0;

export const cityIndexes = (data: SnapshotData) => data.areas.map((_, i) => i).filter((i) => i !== NATIONAL);

/**
 * 特化係数 = （その都市の食料支出に占める品目の割合）÷（全国の同じ割合）。
 * 1 より大きければ、その都市は食費のうちその品目に全国より多く振り向けている。
 */
export function specialization(data: SnapshotData, code: string, i: number): number | null {
  const v = data.values[code]![i];
  const food = data.values.LB00![i];
  const nv = data.values[code]![NATIONAL];
  const nfood = data.values.LB00![NATIONAL];
  if (v == null || !food || !nv || !nfood) return null;
  return v / food / (nv / nfood);
}
