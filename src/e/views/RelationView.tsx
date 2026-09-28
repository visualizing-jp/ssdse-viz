/**
 * 関係ビュー。2つの項目を選んで、47都道府県の散布図にする。
 */

import { use, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { withUnit } from "../../shared/format.ts";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Scatter } from "../../shared/Scatter.tsx";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import { indicatorGroups, valuesOf } from "../../shared/snapshot.ts";
import type { Indicator } from "../../shared/types.ts";
import { useUrlState } from "../../shared/useUrlState.ts";
import { loadE, prefIndexes } from "../data.ts";

const SCALES = [
  { value: "linear" as const, label: "線形" },
  { value: "log" as const, label: "対数" },
];

export function axisLabel(ind: Indicator, mode: Mode): string {
  const m = effectiveMode(ind, mode);
  const parts = [basisOf(ind, m), unitOf(ind, m)].filter(Boolean);
  return parts.length > 0 ? `${ind.label}（${parts.join("・")}）` : ind.label;
}

export function RelationView() {
  const data = use(loadE());
  const valid = (v: string) => v in data.values;
  const [xc, setX] = useUrlState("x", "A1303", valid);
  const [yc, setY] = useUrlState("ind", "I6100", valid);
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [sc, setSc] = useUrlState<"linear" | "log">("scale", "linear", (v) => v === "linear" || v === "log");
  const [area, setArea] = useUrlState("area", "", (v) => v === "" || data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const xi = data.indicators.find((i) => i.code === xc)!;
  const yi = data.indicators.find((i) => i.code === yc)!;
  const xs = useMemo(() => valuesOf(data, xi, mode), [data, xi, mode]);
  const ys = useMemo(() => valuesOf(data, yi, mode), [data, yi, mode]);
  const prefs = prefIndexes(data);
  const focus = area || hovered;
  const f = data.areas.findIndex((a) => a.code === focus);
  const groups = indicatorGroups(data.groups, data.indicators);

  return (
    <ViewLayout>
      <ViewHeader
        title="2つの項目の関係"
        meta={
          f >= 0 ? (
            <span className="font-semibold text-ink">
              {data.areas[f]!.label}: 横 {withUnit(xs[f]!, unitOf(xi, effectiveMode(xi, mode)))} · 縦{" "}
              {withUnit(ys[f]!, unitOf(yi, effectiveMode(yi, mode)))}
            </span>
          ) : (
            "点にふれると都道府県名と値、クリックで固定"
          )
        }
      >
        <Segmented label="見る単位" options={MODES} value={mode} onChange={setMode} />
        <Segmented label="軸" options={SCALES} value={sc} onChange={setSc} />
      </ViewHeader>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 text-[12px] text-muted">
        <span className="flex items-center gap-2">
          縦軸 <Select label="縦軸の項目" value={yc} onChange={setY} groups={groups} wide />
        </span>
        <span className="flex items-center gap-2">
          横軸 <Select label="横軸の項目" value={xc} onChange={setX} groups={groups} wide />
        </span>
        <button
          type="button"
          onClick={() => {
            setX(yc);
            setY(xc);
          }}
          className="cursor-pointer rounded-md border border-rule bg-surface px-2.5 py-1 text-[12px] transition-[transform,border-color] duration-150 ease-out hover:border-rule-strong active:scale-[0.97]"
        >
          縦横を入れ替える
        </button>
      </div>

      <Scatter
        points={prefs.map((i) => ({ code: data.areas[i]!.code, label: data.areas[i]!.label, x: xs[i]!, y: ys[i]! }))}
        xLabel={axisLabel(xi, mode)}
        yLabel={axisLabel(yi, mode)}
        logX={sc === "log"}
        logY={sc === "log"}
        focus={focus}
        onHover={setHovered}
        onPin={(c) => setArea(c === area ? "" : c)}
      />

      <Notes
        read={[
          "1点が1都道府県です（全国は含みません）。右上がりなら、一方が大きい県ほど他方も大きい傾向です。",
          "実数どうしを比べると、どちらも人口の大きさに引っぱられて強い相関が出がちです。「人口あたり・割合」で比べると、その見かけの相関を外せます。",
          "東京都のように1点だけ離れた県があると、相関係数はその1点で大きく変わります。対数軸にすると偏りが和らぎます。",
        ]}
        caution={[
          "相関は因果を示しません。高齢化・都市化など、両方に効く別の要因がないか考えてください。",
          "2つの項目の年次が違うことがあります（年次は地域ビューの項目リストで確認できます）。",
          "対数軸では0以下の値を描けないので、その都道府県は点から外れます。",
        ]}
      />
    </ViewLayout>
  );
}
