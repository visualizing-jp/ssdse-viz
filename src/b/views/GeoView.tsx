/**
 * 地域ビュー。選んだ年度の都道府県差（タイル地図＋順位）。
 */

import { use, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Legend } from "../../shared/Legend.tsx";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Ranking } from "../../shared/Ranking.tsx";
import { quantileScale } from "../../shared/scales.ts";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import { ranks } from "../../shared/snapshot.ts";
import { TileMap } from "../../shared/TileMap.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { DEFAULT_IND, loadB, medians, seriesOf } from "../data.ts";

export function GeoView() {
  const data = use(loadB());
  const years = data.years.map(String);
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => v in data.values);
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [year, setYear] = useUrlState("year", years.at(-1)!, (v) => years.includes(v));
  const [area, setArea] = useUrlState("area", "13", (v) => data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const table = useMemo(() => seriesOf(data, ind, m), [data, ind, m]);
  const yi = years.indexOf(year);
  const row = table[yi]!;
  const med = medians(table)[yi]!;
  const rank = ranks(row, () => true);
  const scale = quantileScale(row, (v) => withUnit(v, ""));
  const focus = hovered ?? area;
  const fi = data.areas.findIndex((a) => a.code === focus);
  const prev = yi > 0 ? ranks(table[0]!, () => true) : null;

  return (
    <ViewLayout
      aside={<IndicatorList groups={data.groups} indicators={data.indicators} selected={code} onSelect={setCode} />}
    >
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {year}年度 · {basisOf(ind, m) || "実数"}（{unit || "単位なし"}） · 中央値 {withUnit(med, unit)}
            {fi >= 0 && (
              <>
                <br />
                <span className="font-semibold text-ink">
                  {data.areas[fi]!.label} {withUnit(row[fi]!, unit)}（{rank[fi]}位 / 47
                  {prev ? ` · ${data.years[0]}年度は${prev[fi]}位` : ""}）
                </span>
              </>
            )}
          </>
        }
      >
        <Select label="年度" value={year} onChange={setYear} options={years.map((y) => ({ value: y, label: `${y}年度` }))} />
        <Segmented
          label="見る単位"
          options={MODES.map((o) => ({ ...o, disabled: o.value === "rate" && !ind.rate }))}
          value={m}
          onChange={setMode}
        />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
        <div>
          <TileMap
            tiles={data.areas.map((a, i) => ({ code: a.code, label: a.label, value: row[i]!, text: withUnit(row[i]!, "") }))}
            scale={scale}
            hovered={hovered}
            onHover={setHovered}
            pinned={area}
            onPin={(c) => setArea(c ?? area)}
          />
          <Legend scale={scale} caption={`${year}年度の7分位`} />
        </div>
        <div>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">都道府県順位 · 中央値比</h3>
          <Ranking
            rows={data.areas.map((a, i) => ({
              code: a.code,
              label: a.label,
              value: row[i]!,
              text: withUnit(row[i]!, unit),
              sub: med ? `×${(row[i]! / med).toFixed(2)}` : undefined,
            }))}
            highlighted={focus}
            onHover={setHovered}
            onSelect={setArea}
          />
        </div>
      </div>

      <Notes
        read={[
          "年度を切り替えると、同じ項目の都道府県差がどう動いたかを見られます。色の区切りは年度ごとに付け直しています。",
          "見出しには、選んだ都道府県の最初の年度（2012年度）の順位も出しています。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </ViewLayout>
  );
}
