/**
 * 地域ビュー。月か年を選んで、47地点の差をタイル地図・順位・緯度との関係で見る。
 */

import { use, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Legend } from "../../shared/Legend.tsx";
import { Ranking } from "../../shared/Ranking.tsx";
import { Scatter } from "../../shared/Scatter.tsx";
import { quantileScale } from "../../shared/scales.ts";
import { Select } from "../../shared/Select.tsx";
import { TileMap } from "../../shared/TileMap.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS } from "../annotations.ts";
import { loadF, monthlyScale, periodLabel } from "../data.ts";

export function GeoView() {
  const data = use(loadF());
  const [code, setCode] = useUrlState("ind", "CN640", (v) => v in data.values);
  const [period, setPeriod] = useUrlState("period", "年", (v) => data.periods.includes(v));
  const [area, setArea] = useUrlState("area", "", (v) => v === "" || data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const pi = data.periods.indexOf(period);
  const row = data.values[code]!.map((r) => r[pi]!);
  const digits = ind.unit === "cm" || ind.unit === "%" ? 0 : 1;
  const scale = pi < 12 ? monthlyScale(data, code) : quantileScale(row, (v) => num(v, digits));
  const focus = hovered ?? (area || null);
  const fi = data.areas.findIndex((a) => a.code === focus);

  return (
    <ViewLayout aside={<IndicatorList groups={data.groups} indicators={data.indicators} selected={code} onSelect={setCode} />}>
      <ViewHeader
        title={`${ind.label}（${periodLabel(period)}）`}
        meta={
          fi >= 0 ? (
            <span className="font-semibold text-ink">
              {data.areas[fi]!.label}（{data.areas[fi]!.pref}） {withUnit(row[fi]!, ind.unit, digits)}
            </span>
          ) : (
            `単位 ${ind.unit}`
          )
        }
      >
        <Select label="月・年" value={period} onChange={setPeriod} options={data.periods.map((p) => ({ value: p, label: periodLabel(p) }))} />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
        <div>
          <TileMap
            tiles={data.areas.map((a, i) => ({ code: a.code, label: a.pref!, value: row[i]!, text: num(row[i]!, digits) }))}
            scale={scale}
            hovered={hovered}
            onHover={setHovered}
            pinned={area || null}
            onPin={(c) => setArea(c ?? "")}
          />
          <Legend scale={scale} caption={pi < 12 ? "月の色（季節ビューと共通）" : "年の値の7分位"} />
        </div>
        <div>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">地点の順位</h3>
          <Ranking
            rows={data.areas.map((a, i) => ({ code: a.code, label: a.label, value: row[i]!, text: withUnit(row[i]!, ind.unit, digits) }))}
            highlighted={focus}
            onHover={setHovered}
            onSelect={(c) => setArea(c === area ? "" : c)}
          />
        </div>
      </div>

      <section className="pt-8">
        <h3 className="pb-2 text-[12px] font-semibold text-muted">緯度との関係</h3>
        <Scatter
          points={data.areas.map((a, i) => ({ code: a.code, label: a.label, x: a.lat!, y: row[i]! }))}
          xLabel="北緯（度）"
          yLabel={`${ind.label}（${ind.unit}）`}
          focus={focus}
          onHover={setHovered}
          onPin={(c) => setArea(c === area ? "" : c)}
          height={360}
        />
      </section>

      <Notes
        read={[
          "マスの名前は都道府県ですが、値はその県の観測地点（多くは県庁所在市）のものです。",
          "下の散布図は、横軸に地点の緯度をとったものです。緯度だけで説明できない地点（日本海側と太平洋側の違いなど）を探す手がかりになります。",
        ]}
        caution={COMMON_CAUTIONS}
      />
    </ViewLayout>
  );
}
