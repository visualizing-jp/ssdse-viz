/**
 * SSDSE-C-2026: 全国・47都道府県庁所在市 × 家計消費226項目。
 * 二人以上の世帯の1世帯当たり年間支出金額（円）の 2023〜2025年平均。世帯人員（人）だけ別。
 */

import type { Area, Group, Indicator, SnapshotData } from "../../src/shared/types.ts";
import { num, prefOf, readSheet, valueCodes } from "../lib/csv.ts";
import { source, writeJson } from "../lib/out.ts";

const isClass = (c: string) => /^LB\d{2}$/.test(c) && c !== "LB00";

export function buildC(): SnapshotData {
  const sheet = readSheet("SSDSE-C-2026.csv", { years: null, labels: 1, data: 2 });
  const codes = valueCodes(sheet, 3);
  const label = (c: string) => sheet.labels[sheet.col(c)]!.replace(/^\d{2}\s+/, "").trim();

  const groups: Group[] = [
    { id: "total", label: "合計" },
    ...codes.filter(isClass).map((c) => ({ id: c, label: label(c) })),
  ];
  const indicators: Indicator[] = codes.map((code) => {
    const base = { code, label: label(code), year: null };
    if (code === "LA03") return { ...base, unit: "人", group: "total" };
    if (code === "LB00") return { ...base, unit: "円", group: "total" };
    if (isClass(code)) return { ...base, unit: "円", group: code, parent: "LB00" };
    return { ...base, unit: "円", group: code.slice(0, 4), parent: code.slice(0, 4) };
  });
  const areas: Area[] = sheet.data.map((r) => ({
    code: prefOf(r[0]!),
    label: r[2]!,
    pref: r[1]!,
  }));
  const values = Object.fromEntries(codes.map((c) => [c, sheet.data.map((r) => num(r[sheet.col(c)]))]));
  const data: SnapshotData = {
    source: source(
      "SSDSE-C-2026",
      "SSDSE-家計消費",
      "総務省統計局「家計調査」2023年〜2025年平均",
      "kaisetsu-C-2026",
    ),
    groups,
    indicators,
    areas,
    values,
  };
  writeJson("c.json", data);
  return data;
}
