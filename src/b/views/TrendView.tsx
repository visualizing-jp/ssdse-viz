/**
 * 推移ビュー。選んだ項目の2012〜2023年度を、47本の線と中央値で見る。
 */

import { use, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { LineChart } from "../../shared/LineChart.tsx";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import { Spark } from "../../shared/Spark.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { byArea, DEFAULT_IND, loadB, medians, seriesOf } from "../data.ts";

export function TrendView() {
  const data = use(loadB());
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => v in data.values);
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [area, setArea] = useUrlState("area", "13", (v) => data.areas.some((a) => a.code === v));
  const [hovered, setHovered] = useState<string | null>(null);

  const ind = data.indicators.find((i) => i.code === code)!;
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const table = useMemo(() => seriesOf(data, ind, m), [data, ind, m]);
  const med = medians(table);
  const focus = hovered ?? area;
  const fi = data.areas.findIndex((a) => a.code === focus);
  const fs = fi >= 0 ? byArea(table, fi) : null;
  const first = data.years[0]!;
  const last = data.years.at(-1)!;
  const change = (vals: (number | null)[]) => {
    const a = vals[0];
    const b = vals.at(-1);
    return a && b ? ((b - a) / Math.abs(a)) * 100 : null;
  };
  const sparkFor = useMemo(() => {
    const cache = new Map<string, (number | null)[]>();
    return (code: string) => {
      let s = cache.get(code);
      if (s === undefined) {
        const i = data.indicators.find((x) => x.code === code)!;
        s = medians(seriesOf(data, i, effectiveMode(i, mode)));
        cache.set(code, s);
      }
      return s;
    };
  }, [data, mode]);

  return (
    <ViewLayout
      aside={
        <IndicatorList
          groups={data.groups}
          indicators={data.indicators}
          selected={code}
          onSelect={setCode}
          aside={(i) => <Spark values={sparkFor(i.code)} />}
        />
      }
    >
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {first}〜{last}年度 · {basisOf(ind, m) || "実数"}（{unit || "単位なし"}）
            <br />
            47都道府県の中央値 {withUnit(med[0]!, unit)} → {withUnit(med.at(-1)!, unit)}
            {fs && (
              <>
                {" · "}
                <span className="font-semibold text-accent">
                  {data.areas[fi]!.label} {withUnit(fs[0]!, unit)} → {withUnit(fs.at(-1)!, unit)}
                  {change(fs) !== null && `（${change(fs)! >= 0 ? "+" : ""}${num(change(fs), 1)}%）`}
                </span>
              </>
            )}
          </>
        }
      >
        <Select
          label="都道府県"
          value={area}
          onChange={setArea}
          options={data.areas.map((a) => ({ value: a.code, label: a.label }))}
        />
        <Segmented
          label="見る単位"
          options={MODES.map((o) => ({ ...o, disabled: o.value === "rate" && !ind.rate }))}
          value={m}
          onChange={setMode}
        />
      </ViewHeader>

      <LineChart
        xs={data.years}
        series={data.areas.map((a, i) => ({ code: a.code, label: a.label, values: byArea(table, i) }))}
        reference={med}
        referenceLabel="中央値"
        focus={focus}
        onHover={setHovered}
        onPin={setArea}
        format={(v) => num(v, Math.abs(v) < 10 && !Number.isInteger(v) ? 1 : 0)}
      />

      <Notes
        read={[
          "細い線が47都道府県、破線が47都道府県の中央値、赤い線が選んだ都道府県です。線にふれるとその都道府県に切り替わり、クリックで固定します。",
          "左の小さな線は、各項目の中央値の推移です。形の似た項目を探す手がかりになります。",
          "「人口あたり・割合」では、分母に同じ年度の総人口を使います。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </ViewLayout>
  );
}
