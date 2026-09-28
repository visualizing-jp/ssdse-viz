/**
 * 人口規模ビュー。横軸に総人口（対数）、縦軸に選んだ項目をとった1741点の散布図。
 * 大都市と小さな町村で傾向が違うかを見る。
 */

import { Suspense, use, useDeferredValue, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Scatter } from "../../shared/Scatter.tsx";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import type { Indicator, MuniMeta } from "../../shared/types.ts";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { DEFAULT_IND, loadMeta, loadValues, useMuniValues } from "../data.ts";
import { prefOptions } from "./MapView.tsx";

const SCALES = [
  { value: "linear" as const, label: "縦 線形" },
  { value: "log" as const, label: "縦 対数" },
];

export function SizeView() {
  const meta = use(loadMeta());
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => meta.indicators.some((i) => i.code === v));
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [pref, setPref] = useUrlState("pref", "", (v) => v === "" || meta.prefs.some((p) => p.code === v));
  const [muni, setMuni] = useUrlState("muni", "", (v) => v === "" || meta.areas.some((a) => a.code === v));
  const [sc, setSc] = useUrlState<"linear" | "log">("scale", "linear", (v) => v === "linear" || v === "log");
  const shownCode = useDeferredValue(code);
  const ind = meta.indicators.find((i) => i.code === shownCode)!;

  return (
    <ViewLayout aside={<IndicatorList groups={meta.groups} indicators={meta.indicators} selected={code} onSelect={setCode} />}>
      <Suspense fallback={<p className="py-16 text-[12px] text-faint">読み込み中</p>}>
        <SizeBody meta={meta} ind={ind} mode={mode} setMode={setMode} pref={pref} setPref={setPref} muni={muni} setMuni={setMuni} sc={sc} setSc={setSc} />
      </Suspense>
    </ViewLayout>
  );
}

function SizeBody({
  meta,
  ind,
  mode,
  setMode,
  pref,
  setPref,
  muni,
  setMuni,
  sc,
  setSc,
}: {
  meta: MuniMeta;
  ind: Indicator;
  mode: Mode;
  setMode: (m: Mode) => void;
  pref: string;
  setPref: (p: string) => void;
  muni: string;
  setMuni: (m: string) => void;
  sc: "linear" | "log";
  setSc: (s: "linear" | "log") => void;
}) {
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const values = useMuniValues(ind, m);
  const pop = use(loadValues("A1101"));
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = hovered ?? (muni || null);
  const fi = focus ? meta.areas.findIndex((a) => a.code === focus) : -1;
  const prefName = meta.prefs.find((p) => p.code === pref)?.label;

  return (
    <>
      <ViewHeader
        title={`${ind.label}と人口規模`}
        meta={
          <>
            縦：{basisOf(ind, m) || "実数"}（{unit || "単位なし"}） · 横：総人口（2020年、対数軸）
            {prefName && <> · 青い点が{prefName}</>}
            {fi >= 0 && (
              <>
                <br />
                <span className="font-semibold text-ink">
                  {meta.areas[fi]!.pref} {meta.areas[fi]!.label}：人口 {withUnit(pop[fi]!, "人")} · {withUnit(values[fi]!, unit)}
                </span>
              </>
            )}
          </>
        }
      >
        <Select label="強調する都道府県" value={pref} onChange={setPref} options={prefOptions(meta).map((o) => (o.value === "" ? { ...o, label: "強調なし" } : o))} />
        <Segmented label="縦軸" options={SCALES} value={sc} onChange={setSc} />
        <Segmented
          label="見る単位"
          options={MODES.map((o) => ({ ...o, disabled: o.value === "rate" && !ind.rate }))}
          value={m}
          onChange={setMode}
        />
      </ViewHeader>

      <Scatter
        points={meta.areas.map((a, i) => ({
          code: a.code,
          label: `${a.pref} ${a.label}`,
          x: pop[i]!,
          y: values[i]!,
          group: pref !== "" && a.code.startsWith(pref),
        }))}
        xLabel="総人口（人、対数）"
        yLabel={`${ind.label}（${[basisOf(ind, m), unit].filter(Boolean).join("・") || "値"}）`}
        logX
        logY={sc === "log"}
        focus={focus}
        onHover={setHovered}
        onPin={(c) => setMuni(c === muni ? "" : c)}
        height={500}
      />

      <Notes
        read={[
          "1点が1市区町村です。横軸は対数なので、1千人・1万人・10万人・100万人が等間隔に並びます。",
          "都道府県を選ぶと、その県の市区町村を青で強調します。点にふれると名前と値、クリックで固定します。",
          "相関係数は、対数軸では対数をとった値で計算しています。",
        ]}
        caution={[...cautionsFor(ind), "人口0の双葉町は対数軸に描けないため、点から外れます。", ...COMMON_CAUTIONS]}
      />
    </>
  );
}
