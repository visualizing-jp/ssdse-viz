/**
 * 季節ビュー。47地点 × 12か月のヒートマップ。
 */

import { use, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, short, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Legend } from "../../shared/Legend.tsx";
import { Segmented } from "../../shared/Segmented.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS } from "../annotations.ts";
import { loadF, monthlyScale, MONTHS, YEAR } from "../data.ts";

const ORDERS = [
  { value: "lat" as const, label: "北から" },
  { value: "code" as const, label: "都道府県順" },
  { value: "year" as const, label: "年の値の順" },
];

export function SeasonView() {
  const data = use(loadF());
  const [code, setCode] = useUrlState("ind", "CN500", (v) => v in data.values);
  const [order, setOrder] = useUrlState<"lat" | "code" | "year">("order", "lat", (v) => ORDERS.some((o) => o.value === v));
  const [hovered, setHovered] = useState<{ a: number; m: number } | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const table = data.values[code]!;
  const scale = monthlyScale(data, code);
  const rows = data.areas
    .map((a, i) => ({ a, i }))
    .sort((p, q) =>
      order === "lat" ? q.a.lat! - p.a.lat! : order === "code" ? p.a.code.localeCompare(q.a.code) : table[q.i]![YEAR]! - table[p.i]![YEAR]!,
    );
  const digits = ind.unit === "cm" || ind.unit === "%" ? 0 : 1;
  const h = hovered ? { area: data.areas[hovered.a]!, v: table[hovered.a]![hovered.m]! } : null;

  return (
    <ViewLayout aside={<IndicatorList groups={data.groups} indicators={data.indicators} selected={code} onSelect={setCode} />}>
      <ViewHeader
        title={ind.label}
        meta={
          h ? (
            <span className="font-semibold text-ink">
              {h.area.label}（{h.area.pref}） {hovered!.m + 1}月 {withUnit(h.v, ind.unit, digits)} · 年 {withUnit(table[hovered!.a]![YEAR]!, ind.unit, digits)}
            </span>
          ) : (
            `単位 ${ind.unit} · 升目にふれると地点と月の値`
          )
        }
      >
        <Segmented label="並べ方" options={ORDERS} value={order} onChange={setOrder} />
      </ViewHeader>

      <div className="overflow-x-auto" onMouseLeave={() => setHovered(null)}>
        <table className="w-full min-w-[640px] border-separate border-spacing-[2px] text-[10px]">
          <thead>
            <tr className="text-faint">
              <th className="w-24" />
              {MONTHS.map((m) => (
                <th key={m} className="font-normal">
                  {m + 1}月
                </th>
              ))}
              <th className="w-16 pl-2 text-right font-normal">年</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ a, i }) => (
              <tr key={a.code}>
                <td className="pr-2 text-right whitespace-nowrap text-muted">
                  {a.label}
                  <span className="ml-1 text-faint">{short(a.pref!)}</span>
                </td>
                {MONTHS.map((m) => {
                  const v = table[i]![m]!;
                  const active = hovered?.a === i && hovered.m === m;
                  return (
                    <td
                      key={m}
                      onMouseEnter={() => setHovered({ a: i, m })}
                      className={`tnum h-5 cursor-default rounded-[2px] text-center ${scale.dark(v) ? "text-fill-0" : "text-ink/80"} ${
                        active ? "outline-2 outline-ink" : ""
                      }`}
                      style={{ background: scale.fill(v) }}
                    >
                      {num(v, digits)}
                    </td>
                  );
                })}
                <td className="tnum pl-2 text-right text-ink">{num(table[i]![YEAR]!, digits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Legend scale={scale} caption={code === "CN500" || code === "CN400" ? "気象庁の配色指針の色（閾値は月平年値向け）" : "月の値の7分位"} />

      <Notes
        read={[
          "1行が1地点、1列が1か月です。「北から」に並べると、季節の山が北と南でどうずれるかが読めます。",
          "降水量と日照時間は、気象庁の配色指針の色を使っています（閾値は月の平年値に合わせて本サイトで割り当てたもの）。他の項目は、全地点・全月の値の7分位で塗っています。",
          "右端の「年」は、合計の項目では年合計、日数の項目では年間日数、平均の項目では年平均です。",
        ]}
        caution={COMMON_CAUTIONS}
      />
    </ViewLayout>
  );
}
