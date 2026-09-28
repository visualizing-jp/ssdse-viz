/**
 * SSDSE-A-2026: 1741市区町村 × 125項目。
 * 全部を1ファイルにすると重いので、目録（meta.json）と項目ごとの値（values/{code}.json）に分ける。
 */

import type { Area, MuniMeta } from "../../src/shared/types.ts";
import { muniOf, num, prefOf, readSheet, valueCodes } from "../lib/csv.ts";
import { clean, source, writeJson } from "../lib/out.ts";
import { ssdsIndicators, usedFields } from "../lib/ssds.ts";

export interface MuniBuild {
  meta: MuniMeta;
  values: Record<string, (number | null)[]>;
}

export function buildA(): MuniBuild {
  const sheet = readSheet("SSDSE-A-2026.csv", { years: 1, labels: 2, data: 3 });
  const codes = valueCodes(sheet, 3);
  const indicators = ssdsIndicators(sheet, codes, (c) => sheet.years![sheet.col(c)] ?? null);
  const areas: Area[] = sheet.data.map((r) => ({ code: muniOf(r[0]!), label: r[2]!, pref: r[1]! }));
  const prefs: Area[] = [...new Map(sheet.data.map((r) => [prefOf(r[0]!), r[1]!]))].map(([code, label]) => ({
    code,
    label,
  }));
  const meta: MuniMeta = {
    source: source(
      "SSDSE-A-2026",
      "SSDSE-市区町村",
      "総務省統計局「統計でみる都道府県・市区町村のすがた（社会・人口統計体系）」",
      "kaisetsu-A-2026",
    ),
    groups: usedFields(indicators),
    indicators,
    areas,
    prefs,
  };
  clean("a");
  writeJson("a/meta.json", meta);
  const values: MuniBuild["values"] = {};
  for (const c of codes) {
    values[c] = sheet.data.map((r) => num(r[sheet.col(c)]));
    writeJson(`a/values/${c}.json`, values[c]);
  }
  return { meta, values };
}
