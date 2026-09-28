/**
 * 1時点の表（E・C）から、見る単位（実数／人口あたり）に揃えた値を取り出す。
 */

import { applyMode, type Mode } from "./metric.ts";
import type { Group, Indicator, SnapshotData } from "./types.ts";

/** Select 用に、分野ごとの optgroup にまとめる。 */
export function indicatorGroups(groups: Group[], indicators: Indicator[]) {
  return groups
    .map((g) => ({
      label: g.label,
      options: indicators.filter((i) => i.group === g.id).map((i) => ({ value: i.code, label: i.label })),
    }))
    .filter((g) => g.options.length > 0);
}

export function valuesOf(data: SnapshotData, ind: Indicator, mode: Mode): (number | null)[] {
  const den = ind.rate ? data.values[ind.rate.den] : undefined;
  return applyMode(ind, mode, data.values[ind.code]!, den);
}

/** 大きい順の順位（1始まり、同じ値は同順位）。値のない地域は null。 */
export function ranks(values: (number | null)[], include: (i: number) => boolean): (number | null)[] {
  const pool = values.filter((v, i): v is number => v !== null && include(i));
  return values.map((v, i) => (v === null || !include(i) ? null : 1 + pool.filter((p) => p > v).length));
}

export function byCode<T extends { code: string }>(list: T[]): Map<string, T> {
  return new Map(list.map((x) => [x.code, x]));
}
