/**
 * SSDSE-A・B・E が共有する「社会・人口統計体系」の項目コードまわり。
 *
 * 単位は各セットの解説 PDF（kaisetsu-A-2026 / B-2026 / E-2026）の別表から写した。
 * 同じ項目コードは3セットで同じ単位になっている。表にないコードが来たらビルドを止める。
 */

import type { Group, Indicator, Rate } from "../../src/shared/types.ts";
import type { Sheet } from "./csv.ts";

export const FIELDS: Group[] = [
  { id: "A", label: "人口・世帯" },
  { id: "B", label: "自然環境" },
  { id: "C", label: "経済基盤" },
  { id: "D", label: "行政基盤" },
  { id: "E", label: "教育" },
  { id: "F", label: "労働" },
  { id: "G", label: "文化・スポーツ" },
  { id: "H", label: "居住" },
  { id: "I", label: "健康・医療" },
  { id: "J", label: "福祉・社会保障" },
  { id: "L", label: "家計" },
];

const U: Record<string, string> = {};
const set = (unit: string, codes: string) => {
  for (const c of codes.split(/\s+/).filter(Boolean)) U[c] = unit;
};

// A 人口・世帯
set("人", `A1101 A110101 A110102 A1102 A110201 A110202 A1301 A130101 A130102 A1302 A130201 A130202
  A1303 A130301 A130302 A1419 A141901 A141902 A1700 A4101 A410101 A410102 A4200 A420001 A420002
  A5101 A510101 A510102 A5102 A510201 A510202 A710201`);
set("", "A4103");
set("世帯", "A7101 A710101 A810102 A810105 A811102 A8201 A8301");
set("組", "A9101 A9201");
// B 自然環境
set("ha", "B1101 B1103 B2101");
set("℃", "B4101 B4102 B4103");
set("日", "B4106");
set("mm", "B4109");
// C 経済基盤
set("百万円", "C1121 C1221");
set("千円", "C122101");
set("事業所", `C2108 C210832 C210833 C210835 C210836 C210837 C210838 C210839 C210840 C210841 C210844
  C210845 C210846 C210847 C210848 C210849 C210850 C210851 C210852`);
set("人", `C2208 C220832 C220833 C220835 C220836 C220837 C220838 C220839 C220840 C220841 C220844
  C220845 C220846 C220847 C220848 C220849 C220850 C220851 C220852`);
set("戸", "C310201 C310202");
set("ha", "C3107");
set("棟", "C3301");
set("m²", "C3302");
set("施設", "C3801");
set("室", "C3802");
set("円/m²", "C5401 C5403");
// D 行政基盤
set("人", "D1202");
set("%", "D2203 D2211");
set("千円", "D3201 D320101 D3203 D320303 D320308 D320310 D320311");
// E 教育
set("園", "E1101");
set("校", "E2101 E3101 E3901 E4101 E6101 E6102 E7101 E7102");
set("人", `E1301 E1501 E2401 E2501 E3401 E3501 E3701 E3702 E3904 E3905 E3906 E4401 E4501 E4601 E4602
  E6201 E6202 E6301 E6302 E6501 E650110 E6502 E650210 E7201 E7202`);
// F 労働
set("人", "F1102 F110201 F110202 F1107 F110701 F110702 F1108 F110801 F110802 F2201 F2211 F2221 F3102 F3103 F3104");
set("件", "F3101 F3105");
// G 文化・スポーツ
set("館", "G1201 G1401 G1501");
set("施設", "G1604 G3102 G3201");
set("事業所", "G5101v2");
set("件", "G5105");
set("人泊", "G7101 G7102");
// H 居住
set("戸", "H1100 H110202 H1310 H1401 H1800 H1801 H1802 H1803");
set("m²", "H2130 H2600 H2601 H2602 H2603");
set("人", "H5507 H550701");
set("t", "H5609");
set("g/人日", "H5610");
set("%", "H5614");
set("事業所", "H6130 H6131 H6132");
// I 健康・医療
set("施設", "I510120 I5102 I5103");
set("人", "I6100 I6200 I6300");
// J 福祉・社会保障
set("所", "J2503 J250302");
set("人", "J2505 J250502 J2506 J2526");
// L 家計（二人以上の世帯の月間消費支出の年平均。県庁所在市の値）
set("円", "L3221 L322101 L322102 L322103 L322104 L322105 L322106 L322107 L322108 L322109 L322110");

const COUNT_UNITS = new Set(["人", "世帯", "組", "事業所", "戸", "施設", "室", "園", "校", "館", "件", "人泊", "所", "棟"]);

const per100k: Rate = { den: "A1101", scale: 1e5, unit: "", label: "人口10万人あたり" };
const share = (den: string, of: string): Rate => ({ den, scale: 100, unit: "%", label: `${of}に占める割合` });

/** 分母を明示して上書きする項目。ここにない件数系は人口10万人あたり。 */
const RATE_OVERRIDES: Record<string, Rate | null> = {
  A1101: null,
  A710201: null,
  A7101: null,
  A710101: null,
  A4103: null,
  ...Object.fromEntries(
    ["A110101", "A110102", "A1102", "A110201", "A110202", "A1301", "A130101", "A130102", "A1302",
      "A130201", "A130202", "A1303", "A130301", "A130302", "A1419", "A141901", "A141902", "A1700"].map(
      (c) => [c, share("A1101", "総人口")],
    ),
  ),
  ...Object.fromEntries(
    ["A810102", "A810105", "A811102", "A8201", "A8301"].map((c) => [c, share("A710101", "一般世帯数")]),
  ),
  E3702: share("E3701", "中学校卒業者数"),
  E4602: share("E4601", "高等学校卒業者数"),
  E650110: share("E6501", "短期大学卒業者数"),
  E650210: share("E6502", "大学卒業者数"),
  G7102: share("G7101", "延べ宿泊者数"),
  H110202: share("H1100", "総住宅数"),
  H1310: share("H1100", "総住宅数"),
  H1401: share("H1100", "総住宅数"),
  H550701: share("H5507", "総人口（非水洗化人口＋水洗化人口）"),
  C1121: { den: "A1101", scale: 1000, unit: "千円", label: "人口1人あたり" },
  C1221: { den: "A1101", scale: 1000, unit: "千円", label: "人口1人あたり" },
  ...Object.fromEntries(
    ["D3201", "D320101", "D3203", "D320303", "D320308", "D320310", "D320311"].map((c) => [
      c,
      { den: "A1101", scale: 1, unit: "千円", label: "人口1人あたり" },
    ]),
  ),
};

function rateOf(code: string, unit: string, has: (code: string) => boolean): Rate | undefined {
  const override = RATE_OVERRIDES[code];
  const rate = override !== undefined ? override : COUNT_UNITS.has(unit) ? { ...per100k, unit } : null;
  if (rate === null) return undefined;
  return has(rate.den) ? rate : undefined;
}

/** 県庁所在市（東京都は区部、気象は熊谷・彦根・千代田）の値を収録している項目。 */
const CAPITAL = /^(B41|L32)/;

export function ssdsIndicators(sheet: Sheet, codes: string[], yearOf: (code: string) => string | null): Indicator[] {
  const has = (c: string) => codes.includes(c);
  return codes.map((code) => {
    const unit = U[code];
    if (unit === undefined) throw new Error(`単位表にない項目コード: ${code}`);
    const rate = rateOf(code, unit, has);
    return {
      code,
      label: sheet.labels[sheet.col(code)]!.replace(/〜/g, "～"),
      unit,
      year: yearOf(code),
      group: code[0]!,
      ...(rate ? { rate } : {}),
      ...(CAPITAL.test(code) ? { capital: true } : {}),
    };
  });
}

export function usedFields(indicators: Indicator[]): Group[] {
  const used = new Set(indicators.map((i) => i.group));
  return FIELDS.filter((f) => used.has(f.id));
}
