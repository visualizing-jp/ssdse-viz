/**
 * 地域ビュー。選んだ品目を、金額・全国比・食料支出に占める割合で地図にする。
 */

import { use, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Legend } from "../../shared/Legend.tsx";
import { Ranking } from "../../shared/Ranking.tsx";
import { quantileScale, ratioScale } from "../../shared/scales.ts";
import { Segmented } from "../../shared/Segmented.tsx";
import { TileMap } from "../../shared/TileMap.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, HOUSEHOLD_NOTE } from "../annotations.ts";
import { cityIndexes, DEFAULT_ITEM, loadC, NATIONAL } from "../data.ts";

type Measure = "yen" | "ratio" | "share";
const MEASURES = [
  { value: "yen" as const, label: "金額" },
  { value: "ratio" as const, label: "全国比" },
  { value: "share" as const, label: "食料に占める割合" },
];

export function GeoView() {
  const data = use(loadC());
  const [code, setCode] = useUrlState("ind", DEFAULT_ITEM, (v) => v in data.values);
  const [measure, setMeasure] = useUrlState<Measure>("measure", "yen", (v) => MEASURES.some((m) => m.value === v));
  const [area, setArea] = useUrlState("area", "", (v) => v === "" || data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const isYen = ind.unit === "円" && code !== "LB00";
  const m: Measure = measure === "share" && !isYen ? "yen" : measure;
  const raw = data.values[code]!;
  const food = data.values.LB00!;
  const value = (i: number): number | null => {
    const v = raw[i]!;
    if (m === "ratio") return v / raw[NATIONAL]!;
    if (m === "share") return (v / food[i]!) * 100;
    return v;
  };
  const fmt = (v: number | null) =>
    m === "ratio" ? (v === null ? "—" : `×${v.toFixed(2)}`) : m === "share" ? withUnit(v, "%", 2) : withUnit(v, ind.unit);
  const cities = cityIndexes(data);
  const scale = m === "ratio" ? ratioScale(1.6) : quantileScale(cities.map(value), (v) => num(v, m === "share" ? 2 : 0));
  const focus = hovered ?? (area || null);
  const fi = data.areas.findIndex((a) => a.code === focus);

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
            全国 {fmt(value(NATIONAL))}
            {fi > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-ink">
                  {data.areas[fi]!.label}（{data.areas[fi]!.pref}） {fmt(value(fi))}
                </span>
              </>
            )}
          </>
        }
      >
        <Segmented
          label="測り方"
          options={MEASURES.map((o) => ({ ...o, disabled: o.value === "share" && !isYen }))}
          value={m}
          onChange={setMeasure}
        />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
        <div>
          <TileMap
            tiles={cities.map((i) => ({
              code: data.areas[i]!.code,
              label: data.areas[i]!.pref!,
              value: value(i),
              text: m === "ratio" ? value(i)!.toFixed(2) : num(value(i), m === "share" ? 2 : 0),
            }))}
            scale={scale}
            hovered={hovered}
            onHover={setHovered}
            pinned={area || null}
            onPin={(c) => setArea(c ?? "")}
          />
          <Legend scale={scale} caption={m === "ratio" ? "全国＝1" : "7分位"} />
        </div>
        <div>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">都市の順位</h3>
          <Ranking
            rows={cities.map((i) => ({ code: data.areas[i]!.code, label: data.areas[i]!.label, value: value(i), text: fmt(value(i)) }))}
            highlighted={focus}
            onHover={setHovered}
            onSelect={(c) => setArea(c === area ? "" : c)}
          />
        </div>
      </div>

      <Notes
        read={[
          "マスの名前は都道府県ですが、値はその県庁所在市のものです（東京都は区部）。",
          "「全国比」は全国平均を1とした倍率で、青は全国より少なく、赤は多い都市です。",
          "「食料に占める割合」は、その都市の食料支出（合計）のうちこの品目が何%かです。世帯の大きさや物価の違いをいくらか打ち消せます。",
        ]}
        caution={[HOUSEHOLD_NOTE, ...COMMON_CAUTIONS]}
      />
    </ViewLayout>
  );
}
