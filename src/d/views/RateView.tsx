/**
 * 行動者率ビュー。選んだ活動の男女の行動者率を、都道府県ごとにダンベル（男・女の2点を結ぶ線）で並べる。
 */

import { scaleLinear } from "d3-scale";
import { use, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, short } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Segmented } from "../../shared/Segmented.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { useWidth } from "../../shared/useWidth.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { at, loadD, NATIONAL } from "../data.ts";

const SORTS = [
  { value: "total" as const, label: "総数の順" },
  { value: "gap" as const, label: "男女差の順" },
];
const ROW = 14;
const LEFT = 64;

export function RateView() {
  const data = use(loadD());
  const rates = data.indicators.filter((i) => ["MB", "MC", "MD", "ME", "MF"].includes(i.group));
  const groups = data.groups.filter((g) => rates.some((i) => i.group === g.id));
  const [code, setCode] = useUrlState("act", "MD271", (v) => rates.some((i) => i.code === v));
  const [sort, setSort] = useUrlState<"total" | "gap">("sort", "total", (v) => v === "total" || v === "gap");
  const [hovered, setHovered] = useState<string | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const ind = rates.find((i) => i.code === code)!;
  const rows = data.areas
    .map((a, i) => ({ a, i, t: at(data, code, 0, i)!, m: at(data, code, 1, i)!, f: at(data, code, 2, i)! }))
    .sort((p, q) => (sort === "total" ? q.t - p.t : q.f - q.m - (p.f - p.m)));
  const max = Math.max(...rows.flatMap((r) => [r.m, r.f]));
  const x = scaleLinear()
    .domain([0, max === 0 ? 1 : max])
    .range([LEFT, Math.max(width - 56, LEFT + 40)])
    .nice();
  const height = rows.length * ROW + 30;
  const n = (s: number) => at(data, code, s, NATIONAL);

  return (
    <ViewLayout
      aside={
        <IndicatorList
          title="活動の種類（行動者率）"
          groups={groups}
          indicators={rates}
          selected={code}
          onSelect={setCode}
          indent={(i) => !i.code.endsWith("00")}
        />
      }
    >
      <ViewHeader
        title={ind.label}
        meta={
          <>
            10歳以上の行動者率（過去1年間に活動した人の割合、%） · 全国 総数 {num(n(0), 1)}% ·{" "}
            <span className="text-male">男 {num(n(1), 1)}%</span> · <span className="text-accent">女 {num(n(2), 1)}%</span>
          </>
        }
      >
        <Segmented label="並べ方" options={SORTS} value={sort} onChange={setSort} />
      </ViewHeader>

      <div ref={ref}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={`${ind.label}の男女別行動者率`} onMouseLeave={() => setHovered(null)}>
            {x.ticks(6).map((t) => (
              <g key={t} transform={`translate(${x(t)},0)`}>
                <line y1={16} y2={height - 6} className="stroke-ink/10" />
                <text y={10} textAnchor="middle" className="tnum fill-muted text-[10px]">
                  {t}%
                </text>
              </g>
            ))}
            {rows.map((r, k) => {
              const y = 24 + k * ROW;
              const active = hovered === r.a.code;
              const nat = r.i === NATIONAL;
              return (
                <g key={r.a.code} onMouseEnter={() => setHovered(r.a.code)}>
                  <rect x={0} y={y - ROW / 2} width={width} height={ROW} fill={active ? "rgba(26,44,52,0.06)" : "transparent"} />
                  <text x={LEFT - 8} y={y} dy="0.32em" textAnchor="end" className={`text-[10px] ${nat ? "fill-ink font-semibold" : "fill-muted"}`}>
                    {short(r.a.label)}
                  </text>
                  <line x1={x(r.m)} x2={x(r.f)} y1={y} y2={y} className="stroke-ink/30" strokeWidth={2} />
                  <circle cx={x(r.m)} cy={y} r={4} className="fill-male" />
                  <circle cx={x(r.f)} cy={y} r={4} className="fill-accent" />
                  {(active || nat) && (
                    <text x={Math.max(x(r.m), x(r.f)) + 8} y={y} dy="0.32em" className="tnum fill-ink text-[10px]">
                      男 {num(r.m, 1)} · 女 {num(r.f, 1)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <Notes
        read={[
          "1行が1地域です。青い点が男、赤い点が女の行動者率で、線の長さが男女差です。",
          "「男女差の順」にすると、女のほうが高い地域が上に、男のほうが高い地域が下に並びます。",
          "左の一覧で字下げされているのは、総数（学習・スポーツ・趣味・ボランティア・旅行の各総数）の内訳です。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </ViewLayout>
  );
}
