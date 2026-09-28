/**
 * 県内のばらつきビュー。47都道府県を1行ずつ並べ、各行に県内の市区町村を点で置く。
 * 県の平均だけでは見えない「県内の幅」を比べる。
 */

import { median, quantile } from "d3-array";
import { scaleLinear } from "d3-scale";
import { Suspense, use, useDeferredValue, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, short, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Ranking } from "../../shared/Ranking.tsx";
import { Segmented } from "../../shared/Segmented.tsx";
import type { Indicator, MuniMeta } from "../../shared/types.ts";
import { useUrlState } from "../../shared/useUrlState.ts";
import { useWidth } from "../../shared/useWidth.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { DEFAULT_IND, loadMeta, useMuniValues } from "../data.ts";

const ROW = 16;
const LEFT = 70;
const SORTS = [
  { value: "median" as const, label: "中央値の順" },
  { value: "range" as const, label: "幅の順" },
  { value: "code" as const, label: "都道府県順" },
];

export function SpreadView() {
  const meta = use(loadMeta());
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => meta.indicators.some((i) => i.code === v));
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [pref, setPref] = useUrlState("pref", "13", (v) => meta.prefs.some((p) => p.code === v));
  const [muni, setMuni] = useUrlState("muni", "", (v) => v === "" || meta.areas.some((a) => a.code === v));
  const shownCode = useDeferredValue(code);
  const ind = meta.indicators.find((i) => i.code === shownCode)!;

  return (
    <ViewLayout aside={<IndicatorList groups={meta.groups} indicators={meta.indicators} selected={code} onSelect={setCode} />}>
      <Suspense fallback={<p className="py-16 text-[12px] text-faint">読み込み中</p>}>
        <SpreadBody meta={meta} ind={ind} mode={mode} setMode={setMode} pref={pref || "13"} setPref={setPref} muni={muni} setMuni={setMuni} />
      </Suspense>
    </ViewLayout>
  );
}

function SpreadBody({
  meta,
  ind,
  mode,
  setMode,
  pref,
  setPref,
  muni,
  setMuni,
}: {
  meta: MuniMeta;
  ind: Indicator;
  mode: Mode;
  setMode: (m: Mode) => void;
  pref: string;
  setPref: (p: string) => void;
  muni: string;
  setMuni: (m: string) => void;
}) {
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const values = useMuniValues(ind, m);
  const [sort, setSort] = useState<"median" | "range" | "code">("median");
  const [hovered, setHovered] = useState<string | null>(null);
  const [ref, width] = useWidth<HTMLDivElement>();

  const rows = useMemo(() => {
    const out = meta.prefs.map((p) => {
      const idx = meta.areas.map((a, i) => (a.code.startsWith(p.code) ? i : -1)).filter((i) => i >= 0);
      const vs = idx.map((i) => values[i]).filter((v): v is number => v !== null);
      const sorted = [...vs].sort((a, b) => a - b);
      return { p, idx, med: median(vs) ?? null, lo: sorted[0] ?? null, hi: sorted.at(-1) ?? null };
    });
    return out.sort((a, b) =>
      sort === "code" ? a.p.code.localeCompare(b.p.code) : sort === "range" ? b.hi! - b.lo! - (a.hi! - a.lo!) : b.med! - a.med!,
    );
  }, [meta, values, sort]);

  const all = values.filter((v): v is number => v !== null).sort((a, b) => a - b);
  const lo = quantile(all, 0.01) ?? 0;
  const hi = quantile(all, 0.99) ?? 1;
  const x = scaleLinear()
    .domain([lo, hi === lo ? lo + 1 : hi])
    .range([LEFT, Math.max(width - 16, LEFT + 40)])
    .nice()
    .clamp(true);
  const height = rows.length * ROW + 30;
  const current = rows.find((r) => r.p.code === pref)!;
  const focus = hovered ?? (muni || null);
  const fi = focus ? meta.areas.findIndex((a) => a.code === focus) : -1;

  return (
    <>
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {ind.year}年度 · {basisOf(ind, m) || "実数"}（{unit || "単位なし"}）
            <br />
            <span className="font-semibold text-ink">
              {current.p.label}：県内の最小 {withUnit(current.lo, unit)} 〜 最大 {withUnit(current.hi, unit)}（中央値 {withUnit(current.med, unit)}）
            </span>
            {fi >= 0 && ` · ${meta.areas[fi]!.label} ${withUnit(values[fi]!, unit)}`}
          </>
        }
      >
        <Segmented label="並べ方" options={SORTS} value={sort} onChange={setSort} />
        <Segmented
          label="見る単位"
          options={MODES.map((o) => ({ ...o, disabled: o.value === "rate" && !ind.rate }))}
          value={m}
          onChange={setMode}
        />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
        <div ref={ref}>
          {width > 0 && (
            <svg width={width} height={height} role="img" aria-label="都道府県ごとの市区町村の分布">
              {x.ticks(6).map((t) => (
                <g key={t} transform={`translate(${x(t)},0)`}>
                  <line y1={16} y2={height - 4} className="stroke-ink/10" />
                  <text y={10} textAnchor="middle" className="tnum fill-muted text-[10px]">
                    {num(t)}
                  </text>
                </g>
              ))}
              {rows.map((r, k) => {
                const y = 24 + k * ROW;
                const active = r.p.code === pref;
                return (
                  <g key={r.p.code} className="cursor-pointer" onClick={() => setPref(r.p.code)}>
                    <rect x={0} y={y - ROW / 2} width={width} height={ROW} fill={active ? "rgba(196,71,42,0.08)" : "transparent"} />
                    <text x={LEFT - 8} y={y} dy="0.32em" textAnchor="end" className={`text-[10px] ${active ? "fill-ink font-semibold" : "fill-muted"}`}>
                      {short(r.p.label)}
                    </text>
                    {r.lo !== null && <line x1={x(r.lo)} x2={x(r.hi!)} y1={y} y2={y} className="stroke-ink/20" />}
                    {r.idx.map((i) =>
                      values[i] === null ? null : (
                        <circle
                          key={i}
                          cx={x(values[i]!)}
                          cy={y}
                          r={meta.areas[i]!.code === focus ? 4 : 2}
                          className={meta.areas[i]!.code === focus ? "fill-accent" : active ? "fill-accent/50" : "fill-fill-4/40"}
                        />
                      ),
                    )}
                    {r.med !== null && <line x1={x(r.med)} x2={x(r.med)} y1={y - 5} y2={y + 5} className="stroke-ink" strokeWidth={1.5} />}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <div>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">{current.p.label}の市区町村</h3>
          <Ranking
            rows={current.idx.map((i) => ({
              code: meta.areas[i]!.code,
              label: meta.areas[i]!.label,
              value: values[i]!,
              text: withUnit(values[i]!, unit),
            }))}
            highlighted={focus}
            onHover={setHovered}
            onSelect={(c) => setMuni(c === muni ? "" : c)}
            maxHeight="max-h-[760px]"
          />
        </div>
      </div>

      <Notes
        read={[
          "1行が1都道府県で、点がその県の市区町村、縦の短い線が県内の中央値です。行をクリックすると、右にその県の市区町村の一覧を出します。",
          "「幅の順」にすると、県内の最大と最小の差が大きい県から並びます。",
          "横軸は全国の上下1%を切り落とした範囲です。それより外の市区町村は両端に寄せて描いています。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </>
  );
}
