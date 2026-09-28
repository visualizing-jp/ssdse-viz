/**
 * SSDSE-D-2023: 男女の別（総数・男・女）× 全国・47都道府県 × 社会生活121項目（2021年調査）。
 * 単位と集計対象は kaisetsu-D-2023 の別表による。
 */

import type { Area, Group, Indicator, SexData } from "../../src/shared/types.ts";
import { num, prefOf, readSheet, valueCodes } from "../lib/csv.ts";
import { source, writeJson } from "../lib/out.ts";

const GROUPS: Group[] = [
  { id: "MA", label: "推定人口" },
  { id: "MB", label: "学習・自己啓発・訓練" },
  { id: "MC", label: "スポーツ" },
  { id: "MD", label: "趣味・娯楽" },
  { id: "ME", label: "ボランティア活動" },
  { id: "MF", label: "旅行・行楽" },
  { id: "MG", label: "生活時間" },
  { id: "MH", label: "平均時刻" },
];

/** CSV の項目名だけでは総数の項目と区別できないもの。名称は解説の別表どおり。 */
const LABELS: Record<string, string> = {
  MA00: "推定人口（10歳以上の人口）",
  MG51: "通勤・通学（通勤・通学をした人、平日）",
  MG52: "仕事（15歳以上有業者、週全体）",
  MG53: "学業（10歳以上在学者、平日）",
  MH01: "起床",
  MH02: "朝食開始",
  MH03: "夕食開始",
  MH04: "就寝",
  MH51: "出勤（15歳以上有業者）",
  MH52: "仕事からの帰宅（15歳以上有業者）",
};

const SEXES = ["0_総数", "1_男", "2_女"];

function clock(v: string | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v?.trim() ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function buildD(): SexData {
  const sheet = readSheet("SSDSE-D-2023.csv", { years: null, labels: 1, data: 2 });
  const codes = valueCodes(sheet, 3);
  const indicators: Indicator[] = codes.map((code) => {
    const group = code.slice(0, 2);
    const unit = group === "MA" ? "千人" : group === "MG" ? "分" : group === "MH" ? "時:分" : "%";
    return {
      code,
      label: LABELS[code] ?? sheet.labels[sheet.col(code)]!.trim(),
      unit,
      year: null,
      group,
      ...(group === "MH" ? { clock: true } : {}),
    };
  });
  const areaCodes = [...new Set(sheet.data.map((r) => prefOf(r[1]!)))].sort();
  const areas: Area[] = areaCodes.map((code) => ({
    code,
    label: sheet.data.find((r) => prefOf(r[1]!) === code)![2]!,
  }));
  const at = new Map(sheet.data.map((r) => [`${r[0]}-${prefOf(r[1]!)}`, r]));
  const values = Object.fromEntries(
    indicators.map((ind) => [
      ind.code,
      SEXES.map((s) =>
        areaCodes.map((a) => {
          const cell = at.get(`${s}-${a}`)?.[sheet.col(ind.code)];
          return ind.clock ? clock(cell) : num(cell);
        }),
      ),
    ]),
  );
  const data: SexData = {
    source: source(
      "SSDSE-D-2023",
      "SSDSE-社会生活",
      "総務省統計局「令和3年社会生活基本調査」（調査票Aに基づく結果）",
      "kaisetsu-D-2023",
    ),
    groups: GROUPS,
    indicators,
    areas,
    sexes: ["総数", "男", "女"],
    values,
  };
  writeJson("d.json", data);
  return data;
}
