/**
 * 品目ビュー。選んだ品目の都市間の分布と、同じ中分類の品目の「都市差の大きさ」。
 */

import { use, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { DotPlot } from "../../shared/DotPlot.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, HOUSEHOLD_NOTE } from "../annotations.ts";
import { cityIndexes, DEFAULT_ITEM, loadC, NATIONAL } from "../data.ts";

export function ItemView() {
  const data = use(loadC());
  const [code, setCode] = useUrlState("ind", DEFAULT_ITEM, (v) => v in data.values);
  const [area, setArea] = useUrlState("area", "", (v) => v === "" || data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const cities = cityIndexes(data);
  const values = data.values[code]!;
  const national = values[NATIONAL]!;
  const focus = hovered ?? (area || null);
  const fi = data.areas.findIndex((a) => a.code === focus);
  const food = data.values.LB00![NATIONAL]!;

  const siblings = useMemo(() => {
    const parent = ind.parent ?? (ind.code === "LB00" ? null : "LB00");
    const pool = data.indicators.filter((i) => (parent === null ? i.code === "LB00" : i.parent === parent));
    return pool
      .map((i) => {
        const vs = cities.map((c) => ({ c, v: data.values[i.code]![c]! }));
        const hi = vs.reduce((a, b) => (b.v > a.v ? b : a));
        const lo = vs.reduce((a, b) => (b.v < a.v ? b : a));
        return { ind: i, hi, lo, spread: lo.v > 0 ? hi.v / lo.v : null, national: data.values[i.code]![NATIONAL]! };
      })
      .sort((a, b) => (b.spread ?? Infinity) - (a.spread ?? Infinity));
  }, [data, ind, cities]);
  const parentLabel = ind.parent ? data.indicators.find((i) => i.code === ind.parent)?.label : null;

  return (
    <ViewLayout
      aside={
        <IndicatorList
          title="品目（中分類ごと）"
          groups={data.groups}
          indicators={data.indicators}
          selected={code}
          onSelect={setCode}
          indent={(i) => i.parent !== undefined && i.parent !== "LB00"}
        />
      }
    >
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {ind.unit === "円" ? "1世帯当たり年間支出（円）" : "世帯人員（人）"} · 全国 {withUnit(national, ind.unit)}
            {ind.unit === "円" && ind.code !== "LB00" && ` · 食料支出の ${num((national / food) * 100, 2)}%`}
            {fi > 0 && (
              <>
                <br />
                <span className="font-semibold text-accent">
                  {data.areas[fi]!.label}（{data.areas[fi]!.pref}） {withUnit(values[fi]!, ind.unit)} · 全国比 ×
                  {(values[fi]! / national).toFixed(2)}
                </span>
              </>
            )}
          </>
        }
      />

      <h3 className="pb-1 text-[12px] font-semibold text-muted">47都市の分布（1点が1都市）</h3>
      <DotPlot
        dots={cities.map((i) => ({ code: data.areas[i]!.code, label: data.areas[i]!.label, value: values[i]! }))}
        reference={national}
        referenceLabel="全国"
        focus={focus}
        onHover={setHovered}
        onPin={(c) => setArea(c === area ? "" : c)}
        format={(v) => num(v, ind.unit === "人" ? 2 : 0)}
      />

      <section className="pt-6">
        <h3 className="pb-2 text-[12px] font-semibold text-muted">
          {parentLabel ? `「${parentLabel}」の品目` : "中分類"}で、都市差の大きい順（最大の都市 ÷ 最小の都市）
        </h3>
        <table className="w-full text-[12px]">
          <thead className="text-[11px] text-faint">
            <tr className="border-b border-ink/10">
              <th className="py-1 text-left font-normal">品目</th>
              <th className="py-1 text-right font-normal">全国</th>
              <th className="py-1 pl-3 text-left font-normal max-md:hidden">最大</th>
              <th className="py-1 pl-3 text-left font-normal max-md:hidden">最小</th>
              <th className="py-1 text-right font-normal">倍率</th>
            </tr>
          </thead>
          <tbody>
            {siblings.map((s) => (
              <tr
                key={s.ind.code}
                onClick={() => setCode(s.ind.code)}
                className={`cursor-pointer border-b border-ink/5 transition-colors duration-150 hover:bg-ink/[0.04] ${
                  s.ind.code === code ? "bg-ink/[0.07] font-semibold" : ""
                }`}
              >
                <td className="py-1.5">{s.ind.label}</td>
                <td className="tnum py-1.5 text-right">{withUnit(s.national, s.ind.unit)}</td>
                <td className="tnum py-1.5 pl-3 text-muted max-md:hidden">
                  {data.areas[s.hi.c]!.label} {num(s.hi.v)}
                </td>
                <td className="tnum py-1.5 pl-3 text-muted max-md:hidden">
                  {data.areas[s.lo.c]!.label} {num(s.lo.v)}
                </td>
                <td className="tnum py-1.5 text-right">{s.spread === null ? "—" : `${num(s.spread, 1)}倍`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Notes
        read={[
          "上の図は47都市の分布で、破線が全国の値です。両端の3都市に名前を付けています。点にふれると都市名、クリックで固定します。",
          "下の表は、同じ中分類の品目を「最大の都市が最小の都市の何倍か」で並べたものです。地域色の強い品目ほど上に来ます。",
        ]}
        caution={[
          "最小の都市の支出がごく小さい品目では、倍率が極端に大きくなります。金額そのものも確かめてください。",
          HOUSEHOLD_NOTE,
          ...COMMON_CAUTIONS,
        ]}
      />
    </ViewLayout>
  );
}
