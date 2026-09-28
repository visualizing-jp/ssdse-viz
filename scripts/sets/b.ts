/** SSDSE-B-2026: 47都道府県 × 12年次（2012〜2023年度）× 109項目。全国行はない。 */

import type { Area, SeriesData } from "../../src/shared/types.ts";
import { num, prefOf, readSheet, valueCodes } from "../lib/csv.ts";
import { source, writeJson } from "../lib/out.ts";
import { ssdsIndicators, usedFields } from "../lib/ssds.ts";

export function buildB(): SeriesData {
  const sheet = readSheet("SSDSE-B-2026.csv", { years: null, labels: 1, data: 2 });
  const codes = valueCodes(sheet, 3);
  const indicators = ssdsIndicators(sheet, codes, () => null);
  const years = [...new Set(sheet.data.map((r) => Number(r[0])))].sort((a, b) => a - b);
  const areaCodes = [...new Set(sheet.data.map((r) => prefOf(r[1]!)))].sort();
  const areas: Area[] = areaCodes.map((code) => ({
    code,
    label: sheet.data.find((r) => prefOf(r[1]!) === code)![2]!,
  }));
  const at = new Map(sheet.data.map((r) => [`${r[0]}-${prefOf(r[1]!)}`, r]));
  const values = Object.fromEntries(
    codes.map((c) => [
      c,
      years.map((y) => areaCodes.map((a) => num(at.get(`${y}-${a}`)?.[sheet.col(c)]))),
    ]),
  );
  const data: SeriesData = {
    source: source(
      "SSDSE-B-2026",
      "SSDSE-県別推移",
      "総務省統計局「統計でみる都道府県・市区町村のすがた（社会・人口統計体系）」",
      "kaisetsu-B-2026",
    ),
    groups: usedFields(indicators),
    indicators,
    areas,
    years,
    values,
  };
  writeJson("b.json", data);
  return data;
}
