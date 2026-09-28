/**
 * 地域ビュー。選んだ項目の都道府県差（タイル地図＋順位）。
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
import { ranks, valuesOf } from "../../shared/snapshot.ts";
import { TileMap } from "../../shared/TileMap.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { DEFAULT_IND, loadE, prefIndexes } from "../data.ts";

export function MapView() {
  const data = use(loadE());
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => v in data.values);
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [area, setArea] = useUrlState("area", "", (v) => v === "" || data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const values = useMemo(() => valuesOf(data, ind, m), [data, ind, m]);
  const prefs = prefIndexes(data);
  const rank = ranks(values, (i) => data.areas[i]!.code !== "00");
  const national = values[data.areas.findIndex((a) => a.code === "00")] ?? null;
  const scale = quantileScale(prefs.map((i) => values[i]!), (v) => withUnit(v, "", undefined));
  const focus = area || hovered;
  const fi = data.areas.findIndex((a) => a.code === focus);

  const rows = prefs.map((i) => ({
    code: data.areas[i]!.code,
    label: data.areas[i]!.label,
    value: values[i]!,
    text: withUnit(values[i]!, unit),
    sub: national ? `×${(values[i]! / national).toFixed(2)}` : undefined,
  }));

  return (
    <ViewLayout
      aside={
        <IndicatorList
          groups={data.groups}
          indicators={data.indicators}
          selected={code}
          onSelect={setCode}
          aside={(i) => <span className="tnum shrink-0 text-[10px] text-faint">{i.year}</span>}
        />
      }
    >
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {ind.year}年度 · {basisOf(ind, m) || "実数"}（{unit || "単位なし"}）
            <br />
            全国 {withUnit(national, unit)}
            {fi >= 0 && data.areas[fi]!.code !== "00" && (
              <>
                {" · "}
                <span className="font-semibold text-ink">
                  {data.areas[fi]!.label} {withUnit(values[fi]!, unit)}（{rank[fi]}位 / 47）
                </span>
              </>
            )}
          </>
        }
      >
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
            tiles={prefs.map((i) => ({
              code: data.areas[i]!.code,
              label: data.areas[i]!.label,
              value: values[i]!,
              text: withUnit(values[i]!, ""),
            }))}
            scale={scale}
            hovered={hovered}
            onHover={setHovered}
            pinned={area || null}
            onPin={(c) => setArea(c ?? "")}
          />
          <Legend scale={scale} caption={`7分位（${unit || "値"}）`} />
        </div>
        <div>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">都道府県順位 · 全国比</h3>
          <Ranking rows={rows} highlighted={focus} onHover={setHovered} onSelect={(c) => setArea(c === area ? "" : c)} />
        </div>
      </div>

      <Notes
        read={[
          "タイルは1都道府県1マスです。面積の大きい県が目立たないよう、地図の形ではなく位置だけを残しています。",
          "「人口あたり・割合」に切り替えると、人口の多い都県が上位に来るだけの順位から離れられます。分母は見出しに書いています。",
          "タイルや順位をクリックすると、その都道府県を固定して見比べられます。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </ViewLayout>
  );
}
