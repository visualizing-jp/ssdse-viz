/**
 * SSDSE-F-2023v3: 47地点（都道府県庁所在市。埼玉は熊谷、滋賀は彦根）× 月・年 × 気象42項目。
 * 2020年平年値（1991〜2020年）第4.0.1版。単位は kaisetsu-F-2023v3 の別表による。
 */

import type { Area, ClimateData, Group, Indicator } from "../../src/shared/types.ts";
import { num, prefOf, readSheet, valueCodes } from "../lib/csv.ts";
import { source, writeJson } from "../lib/out.ts";

const GROUPS: Group[] = [
  { id: "1", label: "気温" },
  { id: "2", label: "気圧・湿度・蒸気圧" },
  { id: "3", label: "風速" },
  { id: "4", label: "日照" },
  { id: "5", label: "降水量" },
  { id: "6", label: "雪" },
];

const UNITS: Record<string, string> = {
  CN100: "℃", CN110: "℃", CN120: "℃",
  CN200: "hPa", CN210: "hPa", CN220: "%", CN230: "hPa",
  CN300: "m/s",
  CN400: "時間",
  CN500: "mm",
  CN610: "cm", CN620: "cm", CN640: "cm",
};

const LOCATION = new Set(["CN900", "CN910", "CN920"]);

export function buildF(): ClimateData {
  const sheet = readSheet("SSDSE-F-2023v3.csv", { years: null, labels: 1, data: 2 });
  const codes = valueCodes(sheet, 4).filter((c) => !LOCATION.has(c));
  const indicators: Indicator[] = codes.map((code) => ({
    code,
    label: sheet.labels[sheet.col(code)]!.trim(),
    unit: UNITS[code] ?? "日",
    year: null,
    group: code[2]!,
  }));

  const periods = [...Array.from({ length: 12 }, (_, i) => String(i + 1)), "年"];
  const periodOf = (label: string) => {
    const m = /^(\d{2})月$/.exec(label);
    return m ? String(Number(m[1])) : label === "年" ? "年" : null;
  };
  const areaCodes = [...new Set(sheet.data.map((r) => r[0]!))].sort();
  const rowsOf = (region: string) => sheet.data.filter((r) => r[0] === region);
  const areas: Area[] = areaCodes.map((region) => {
    const r = rowsOf(region)[0]!;
    return {
      code: prefOf(region),
      label: r[2]!,
      pref: r[1]!,
      lat: num(r[sheet.col("CN900")])!,
      lon: num(r[sheet.col("CN910")])!,
      alt: num(r[sheet.col("CN920")])!,
    };
  });
  const values = Object.fromEntries(
    codes.map((c) => [
      c,
      areaCodes.map((region) => {
        const byPeriod = new Map(rowsOf(region).map((r) => [periodOf(r[3]!), r]));
        return periods.map((p) => num(byPeriod.get(p)?.[sheet.col(c)]));
      }),
    ]),
  );
  const data: ClimateData = {
    source: source(
      "SSDSE-F-2023v3",
      "SSDSE-気候値",
      "気象庁「地上気象観測統計」2020年平年値（1991〜2020年）第4.0.1版",
      "kaisetsu-F-2023v3",
    ),
    groups: GROUPS,
    indicators,
    areas,
    periods,
    values,
  };
  writeJson("f.json", data);
  return data;
}
