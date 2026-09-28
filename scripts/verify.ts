/**
 * 配信 JSON の検算。
 *
 * 1. 各セットの解説 PDF の「データのレイアウト」に載っている値と一致するか（一次情報との突き合わせ）。
 * 2. 行数・項目数が解説の記載どおりか。
 * 3. 内訳の合計が総数に戻るか（丸め誤差の範囲）。
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ClimateData, MuniMeta, SeriesData, SexData, SnapshotData } from "../src/shared/types.ts";
import { OUT } from "./lib/out.ts";

const load = <T>(path: string): T => JSON.parse(readFileSync(join(OUT, path), "utf8")) as T;

let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? `  ${detail}` : ""}`);
}
function equal(name: string, actual: unknown, expected: unknown): void {
  check(name, actual === expected, actual === expected ? "" : `actual=${String(actual)} expected=${String(expected)}`);
}
const idx = (areas: { code: string }[], code: string) => areas.findIndex((a) => a.code === code);
const nulls = (rows: unknown): number =>
  Array.isArray(rows) ? rows.reduce<number>((n, r) => n + nulls(r), 0) : rows === null ? 1 : 0;

// E: kaisetsu-E-2026 p.1
{
  const e = load<SnapshotData>("e.json");
  equal("E 地域数（全国＋47）", e.areas.length, 48);
  equal("E 項目数", e.indicators.length, 93);
  equal("E 全国 総人口", e.values.A1101![idx(e.areas, "00")], 123802000);
  equal("E 北海道 総人口", e.values.A1101![idx(e.areas, "01")], 5043000);
  equal("E 沖縄県 65歳以上人口", e.values.A1303![idx(e.areas, "47")], 355000);
  equal("E 北海道 住居費", e.values.L322102![idx(e.areas, "01")], 25214);
  equal("E 沖縄県 教養娯楽費", e.values.L322109![idx(e.areas, "47")], 20848);
  equal("E 欠測なし", nulls(e.values), 0);
}

// B: 47都道府県 × 12年次
{
  const b = load<SeriesData>("b.json");
  equal("B 地域数", b.areas.length, 47);
  equal("B 年次", `${b.years[0]}-${b.years.at(-1)} (${b.years.length})`, "2012-2023 (12)");
  equal("B 項目数", b.indicators.length, 109);
  const y = b.years.indexOf(2023);
  equal("B 北海道 2023 総人口", b.values.A1101![y]![idx(b.areas, "01")], 5092000);
  equal("B 北海道 2023 合計特殊出生率", b.values.A4103![y]![idx(b.areas, "01")], 1.06);
  equal("B 欠測なし", nulls(b.values), 0);
}

// C: kaisetsu-C-2026 p.1
{
  const c = load<SnapshotData>("c.json");
  equal("C 地域数（全国＋47市）", c.areas.length, 48);
  equal("C 項目数", c.indicators.length, 226);
  const at = (code: string, area: string) => c.values[code]![idx(c.areas, area)];
  equal("C 全国 世帯人員", at("LA03", "00"), 2.88);
  equal("C 全国 食料（合計）", at("LB00", "00"), 1085539);
  equal("C 札幌市 食料（合計）", at("LB00", "01"), 1007628);
  equal("C 那覇市 学校給食", at("LB122001", "47"), 7277);
  const classes = c.indicators.filter((i) => i.parent === "LB00").map((i) => i.code);
  equal("C 中分類の数", classes.length, 12);
  const worst = Math.max(
    ...c.areas.map((_, a) => Math.abs(classes.reduce((s, k) => s + c.values[k]![a]!, 0) - c.values.LB00![a]!)),
  );
  check("C 中分類の和 ≒ 食料（合計）", worst <= 12, `最大差 ${worst} 円`);
  equal("C 欠測なし", nulls(c.values), 0);
}

// D: kaisetsu-D-2023 p.1
{
  const d = load<SexData>("d.json");
  equal("D 地域数", d.areas.length, 48);
  equal("D 項目数", d.indicators.length, 121);
  const at = (code: string, sex: number, area: string) => d.values[code]![sex]![idx(d.areas, area)];
  equal("D 総数 全国 推定人口", at("MA00", 0, "00"), 112462);
  equal("D 男 全国 学習・自己啓発・訓練", at("MB00", 1, "00"), 39.8);
  equal("D 女 沖縄県 英語", at("MB011", 2, "47"), 14.9);
  equal("D 男 全国 出勤（分）", at("MH51", 1, "00"), 8 * 60 + 2);
  equal("D 女 全国 仕事からの帰宅（分）", at("MH52", 2, "00"), 17 * 60 + 47);
  const acts = d.indicators.filter((i) => /^MG(0[1-9]|1\d|20)$/.test(i.code)).map((i) => i.code);
  equal("D 20の行動", acts.length, 20);
  const worst = Math.max(
    ...[0, 1, 2].flatMap((s) =>
      d.areas.map((_, a) => Math.abs(acts.reduce((sum, k) => sum + d.values[k]![s]![a]!, 0) - 1440)),
    ),
  );
  check("D 20行動の和 ≒ 1440分", worst <= 5, `最大差 ${worst} 分`);
  equal("D 欠測なし", nulls(d.values), 0);
}

// F: kaisetsu-F-2023v3
{
  const f = load<ClimateData>("f.json");
  equal("F 地点数", f.areas.length, 47);
  equal("F 項目数（位置情報3項目を除く）", f.indicators.length, 39);
  equal("F 期間（12か月＋年）", f.periods.length, 13);
  equal("F 埼玉県の地点", f.areas[idx(f.areas, "11")]!.label, "熊谷市");
  equal("F 滋賀県の地点", f.areas[idx(f.areas, "25")]!.label, "彦根市");
  const sapporo = idx(f.areas, "01");
  equal("F 札幌市 1月 平均気温", f.values.CN100![sapporo]![0], -3.2);
  equal("F 札幌市 1月 降水量", f.values.CN500![sapporo]![0], 108.4);
  const worst = Math.max(
    ...f.areas.map((_, a) => {
      const months = f.values.CN500![a]!.slice(0, 12).reduce<number>((s, v) => s + v!, 0);
      return Math.abs(months - f.values.CN500![a]![12]!) / f.values.CN500![a]![12]!;
    }),
  );
  check("F 月降水量の和 ≒ 年降水量", worst < 0.01, `最大 ${(worst * 100).toFixed(2)}%`);
  equal("F 欠測なし", nulls(f.values), 0);
}

// A: 1741市区町村
{
  const meta = load<MuniMeta>("a/meta.json");
  equal("A 市区町村数", meta.areas.length, 1741);
  equal("A 都道府県数", meta.prefs.length, 47);
  equal("A 項目数", meta.indicators.length, 125);
  const pop = load<(number | null)[]>("a/values/A1101.json");
  const men = load<(number | null)[]>("a/values/A110101.json");
  const women = load<(number | null)[]>("a/values/A110102.json");
  const off = pop.filter((p, i) => p !== men[i]! + women[i]!).length;
  equal("A 総人口 = 男 + 女", off, 0);
  const futaba = meta.areas.findIndex((a) => a.code === "07546");
  equal("A 双葉町の2020年国勢調査人口（解説の留意点）", pop[futaba], 0);
  const missing = meta.indicators.reduce(
    (n, i) => n + nulls(load<(number | null)[]>(`a/values/${i.code}.json`)),
    0,
  );
  equal("A 欠測なし", missing, 0);
}

if (failures > 0) {
  console.error(`\n${failures} 件の不一致`);
  process.exit(1);
}
console.log("\nすべて一致");
