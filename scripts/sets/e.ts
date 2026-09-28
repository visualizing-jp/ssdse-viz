/** SSDSE-E-2026: 全国・47都道府県 × 93項目（項目ごとに年次が違う）。 */

import type { Area, SnapshotData } from "../../src/shared/types.ts";
import { num, prefOf, readSheet, valueCodes } from "../lib/csv.ts";
import { source, writeJson } from "../lib/out.ts";
import { ssdsIndicators, usedFields } from "../lib/ssds.ts";

export function buildE(): SnapshotData {
  const sheet = readSheet("SSDSE-E-2026.csv", { years: 1, labels: 2, data: 3 });
  const codes = valueCodes(sheet, 2);
  const indicators = ssdsIndicators(sheet, codes, (c) => sheet.years![sheet.col(c)] ?? null);
  const areas: Area[] = sheet.data.map((r) => ({ code: prefOf(r[0]!), label: r[1]! }));
  const values = Object.fromEntries(codes.map((c) => [c, sheet.data.map((r) => num(r[sheet.col(c)]))]));
  const data: SnapshotData = {
    source: source(
      "SSDSE-E-2026",
      "SSDSE-基本素材",
      "総務省統計局「統計でみる都道府県・市区町村のすがた（社会・人口統計体系）」",
      "kaisetsu-E-2026",
    ),
    groups: usedFields(indicators),
    indicators,
    areas,
    values,
  };
  writeJson("e.json", data);
  return data;
}
