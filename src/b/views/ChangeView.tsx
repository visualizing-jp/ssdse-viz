/**
 * 変化ビュー。2つの年度を選んで、値と順位がどう入れ替わったかを見る。
 */

import { use, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Ranking } from "../../shared/Ranking.tsx";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import { Slope } from "../../shared/Slope.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { DEFAULT_IND, loadB, seriesOf } from "../data.ts";

const AXES = [
  { value: "rank" as const, label: "順位" },
  { value: "value" as const, label: "値" },
];
const DELTAS = [
  { value: "pct" as const, label: "変化率" },
  { value: "diff" as const, label: "差" },
];

export function ChangeView() {
  const data = use(loadB());
  const years = data.years.map(String);
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => v in data.values);
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [from, setFrom] = useUrlState("from", years[0]!, (v) => years.includes(v));
  const [to, setTo] = useUrlState("to", years.at(-1)!, (v) => years.includes(v));
  const [axis, setAxis] = useUrlState<"rank" | "value">("axis", "rank", (v) => v === "rank" || v === "value");
  const [delta, setDelta] = useUrlState<"pct" | "diff">("delta", "pct", (v) => v === "pct" || v === "diff");
  const [area, setArea] = useUrlState("area", "13", (v) => data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const table = useMemo(() => seriesOf(data, ind, m), [data, ind, m]);
  const a = table[years.indexOf(from)]!;
  const b = table[years.indexOf(to)]!;
  const focus = hovered ?? area;
  const d = (i: number) => {
    const x = a[i];
    const y = b[i];
    if (x === null || x === undefined || y === null || y === undefined) return null;
    return delta === "diff" ? y - x : x === 0 ? null : ((y - x) / Math.abs(x)) * 100;
  };
  const yearOptions = years.map((y) => ({ value: y, label: `${y}年度` }));

  return (
    <ViewLayout
      aside={<IndicatorList groups={data.groups} indicators={data.indicators} selected={code} onSelect={setCode} />}
    >
      <ViewHeader
        title={ind.label}
        meta={`${from}年度 → ${to}年度 · ${basisOf(ind, m) || "実数"}（${unit || "単位なし"}）`}
      >
        <Select label="比べる年度（前）" value={from} onChange={setFrom} options={yearOptions} />
        <span className="text-[12px] text-faint">→</span>
        <Select label="比べる年度（後）" value={to} onChange={setTo} options={yearOptions} />
        <Segmented
          label="見る単位"
          options={MODES.map((o) => ({ ...o, disabled: o.value === "rate" && !ind.rate }))}
          value={m}
          onChange={setMode}
        />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
        <div>
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-[12px] font-semibold text-muted">
              {axis === "rank" ? "順位の入れ替わり（8位以上動いた県は赤）" : "値の変化"}
            </h3>
            <Segmented label="縦軸" options={AXES} value={axis} onChange={setAxis} />
          </div>
          <Slope
            rows={data.areas.map((ar, i) => ({ code: ar.code, label: ar.label, from: a[i]!, to: b[i]! }))}
            byRank={axis === "rank"}
            fromLabel={`${from}年度`}
            toLabel={`${to}年度`}
            format={(v) => withUnit(v, "")}
            focus={focus}
            onHover={setHovered}
            onPin={setArea}
          />
        </div>
        <div>
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-[12px] font-semibold text-muted">変化の大きい順</h3>
            <Segmented label="変化の測り方" options={DELTAS} value={delta} onChange={setDelta} />
          </div>
          <Ranking
            rows={data.areas.map((ar, i) => {
              const v = d(i);
              return {
                code: ar.code,
                label: ar.label,
                value: v,
                text: v === null ? "—" : delta === "pct" ? `${v >= 0 ? "+" : ""}${num(v, 1)}%` : `${v >= 0 ? "+" : ""}${withUnit(v, unit)}`,
              };
            })}
            highlighted={focus}
            onHover={setHovered}
            onSelect={setArea}
            maxHeight="max-h-[760px]"
          />
        </div>
      </div>

      <Notes
        read={[
          "順位モードでは47都道府県を上から順に並べ、左右の年度で結びます。線が交差するところで順位が入れ替わっています。",
          "値モードでは縦軸が値になるので、全体が上がったのか下がったのかと、差が広がったのか縮んだのかが読めます。",
          "右の一覧は変化の大きい順です。変化率は前の年度の値に対する割合です。",
        ]}
        caution={[
          ...cautionsFor(ind),
          "順位の変化は小さな値の差でも起きます。値モードで差の大きさを確かめてください。",
          ...COMMON_CAUTIONS,
        ]}
      />
    </ViewLayout>
  );
}
