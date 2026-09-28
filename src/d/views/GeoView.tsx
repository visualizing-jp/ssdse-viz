/**
 * 地域ビュー。行動者率・生活時間・平均時刻のどれでも、男女を選んで都道府県差を見る。
 */

import { use, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { clock, num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Legend } from "../../shared/Legend.tsx";
import { Ranking } from "../../shared/Ranking.tsx";
import { quantileScale } from "../../shared/scales.ts";
import { Segmented } from "../../shared/Segmented.tsx";
import { ranks } from "../../shared/snapshot.ts";
import { TileMap } from "../../shared/TileMap.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { loadD, NATIONAL, SEXES, type SexKey } from "../data.ts";

export function GeoView() {
  const data = use(loadD());
  const [code, setCode] = useUrlState("ind", "MG07", (v) => v in data.values);
  const [sex, setSex] = useUrlState<SexKey>("sex", "0", (v) => SEXES.some((s) => s.value === v));
  const [area, setArea] = useUrlState("area", "", (v) => v === "" || data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const row = data.values[code]![Number(sex)]!;
  const fmt = (v: number | null) => (ind.clock ? clock(v) : withUnit(v, ind.unit));
  const short = (v: number | null) => (ind.clock ? clock(v) : num(v, ind.unit === "%" ? 1 : 0));
  const prefs = data.areas.map((_, i) => i).filter((i) => i !== NATIONAL);
  const scale = quantileScale(prefs.map((i) => row[i]!), short);
  const rank = ranks(row, (i) => i !== NATIONAL);
  const focus = hovered ?? (area || null);
  const fi = data.areas.findIndex((a) => a.code === focus);

  return (
    <ViewLayout aside={<IndicatorList groups={data.groups} indicators={data.indicators} selected={code} onSelect={setCode} />}>
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {data.sexes[Number(sex)]} · 全国 {fmt(row[NATIONAL]!)}
            {fi > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-ink">
                  {data.areas[fi]!.label} {fmt(row[fi]!)}（{ind.clock ? "遅いほうから" : ""}
                  {rank[fi]}位 / 47）
                </span>
              </>
            )}
          </>
        }
      >
        <Segmented label="男女の別" options={SEXES} value={sex} onChange={setSex} />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
        <div>
          <TileMap
            tiles={prefs.map((i) => ({ code: data.areas[i]!.code, label: data.areas[i]!.label, value: row[i]!, text: short(row[i]!) }))}
            scale={scale}
            hovered={hovered}
            onHover={setHovered}
            pinned={area || null}
            onPin={(c) => setArea(c ?? "")}
          />
          <Legend scale={scale} caption={`7分位（${ind.unit}）`} />
        </div>
        <div>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">{ind.clock ? "遅い順" : "大きい順"}</h3>
          <Ranking
            rows={prefs.map((i) => ({ code: data.areas[i]!.code, label: data.areas[i]!.label, value: row[i]!, text: fmt(row[i]!) }))}
            highlighted={focus}
            onHover={setHovered}
            onSelect={(c) => setArea(c === area ? "" : c)}
          />
        </div>
      </div>

      <Notes
        read={[
          "左の一覧から、行動者率（%）・生活時間（分）・平均時刻（時:分）のどれでも選べます。",
          "男女を切り替えると、同じ項目でも県の並びが変わることがあります。",
          "平均時刻は遅いほど濃い色です。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </ViewLayout>
  );
}
