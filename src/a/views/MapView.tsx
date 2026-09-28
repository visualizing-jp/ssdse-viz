/**
 * 地図ビュー。1741市区町村のコロプレス。都道府県で絞り込むと、その県の中で色を付け直す。
 */

import { Suspense, use, useDeferredValue, useMemo, useState } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { IndicatorList } from "../../shared/IndicatorList.tsx";
import { Legend } from "../../shared/Legend.tsx";
import { basisOf, effectiveMode, MODES, unitOf, type Mode } from "../../shared/metric.ts";
import { Ranking } from "../../shared/Ranking.tsx";
import { quantileScale } from "../../shared/scales.ts";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import type { Indicator, MuniMeta } from "../../shared/types.ts";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, cautionsFor } from "../annotations.ts";
import { DEFAULT_IND, loadGeo, loadMeta, useMuniValues } from "../data.ts";
import { MuniMap } from "../MuniMap.tsx";

const ENDS = [
  { value: "top" as const, label: "上位" },
  { value: "bottom" as const, label: "下位" },
];

export function prefOptions(meta: MuniMeta) {
  return [{ value: "", label: "全国" }, ...meta.prefs.map((p) => ({ value: p.code, label: p.label }))];
}

export function MapView() {
  const meta = use(loadMeta());
  const [code, setCode] = useUrlState("ind", DEFAULT_IND, (v) => meta.indicators.some((i) => i.code === v));
  const [mode, setMode] = useUrlState<Mode>("mode", "rate", (v) => v === "raw" || v === "rate");
  const [pref, setPref] = useUrlState("pref", "", (v) => v === "" || meta.prefs.some((p) => p.code === v));
  const [muni, setMuni] = useUrlState("muni", "", (v) => v === "" || meta.areas.some((a) => a.code === v));
  const shownCode = useDeferredValue(code);
  const ind = meta.indicators.find((i) => i.code === shownCode)!;

  return (
    <ViewLayout aside={<IndicatorList groups={meta.groups} indicators={meta.indicators} selected={code} onSelect={setCode} />}>
      <Suspense fallback={<p className="py-16 text-[12px] text-faint">読み込み中</p>}>
        <MapBody meta={meta} ind={ind} mode={mode} setMode={setMode} pref={pref} setPref={setPref} muni={muni} setMuni={setMuni} />
      </Suspense>
    </ViewLayout>
  );
}

function MapBody({
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
  const geo = use(loadGeo());
  const m = effectiveMode(ind, mode);
  const unit = unitOf(ind, m);
  const values = useMuniValues(ind, m);
  const [hovered, setHovered] = useState<string | null>(null);
  const [end, setEnd] = useState<"top" | "bottom">("top");

  const index = useMemo(() => new Map(meta.areas.map((a, i) => [a.code, i])), [meta]);
  const inScope = useMemo(
    () => meta.areas.map((a, i) => ({ a, i })).filter(({ a }) => pref === "" || a.code.startsWith(pref)),
    [meta, pref],
  );
  const valueOf = useMemo(() => (c: string) => values[index.get(c) ?? -1] ?? null, [values, index]);
  const scale = useMemo(() => quantileScale(inScope.map(({ i }) => values[i]!), (v) => num(v)), [inScope, values]);
  const focus = hovered ?? (muni || null);
  const fi = focus ? index.get(focus) : undefined;
  const prefName = pref === "" ? "全国" : meta.prefs.find((p) => p.code === pref)!.label;
  const rows = inScope.map(({ a, i }) => ({
    code: a.code,
    label: pref === "" ? `${a.label}（${a.pref}）` : a.label,
    value: values[i]!,
    text: withUnit(values[i]!, unit),
  }));
  const shown = pref === "" ? rows.filter((r) => r.value !== null).sort((x, y) => (end === "top" ? y.value! - x.value! : x.value! - y.value!)).slice(0, 50) : rows;

  return (
    <>
      <ViewHeader
        title={ind.label}
        meta={
          <>
            {ind.year}年度 · {basisOf(ind, m) || "実数"}（{unit || "単位なし"}） · {prefName} {inScope.length}市区町村
            {fi !== undefined && (
              <>
                <br />
                <span className="font-semibold text-ink">
                  {meta.areas[fi]!.pref} {meta.areas[fi]!.label} {withUnit(values[fi]!, unit)}
                </span>
              </>
            )}
          </>
        }
      >
        <Select label="都道府県" value={pref} onChange={setPref} options={prefOptions(meta)} />
        <Segmented
          label="見る単位"
          options={MODES.map((o) => ({ ...o, disabled: o.value === "rate" && !ind.rate }))}
          value={m}
          onChange={setMode}
        />
      </ViewHeader>

      <div className="grid gap-8 xl:grid-cols-[1fr_280px]">
        <div>
          <MuniMap
            geo={geo}
            value={valueOf}
            scale={scale}
            pref={pref}
            focus={focus}
            onHover={setHovered}
            onPin={(c) => setMuni(c === muni ? "" : c)}
          />
          <Legend scale={scale} caption={`${prefName}の7分位`} />
        </div>
        <div>
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-[12px] font-semibold text-muted">{pref === "" ? "全国の50市区町村" : `${prefName}の市区町村`}</h3>
            {pref === "" && <Segmented label="上位・下位" options={ENDS} value={end} onChange={setEnd} />}
          </div>
          <Ranking
            rows={shown}
            highlighted={focus}
            onHover={setHovered}
            onSelect={(c) => setMuni(c === muni ? "" : c)}
            ascending={pref === "" && end === "bottom"}
            maxHeight="max-h-[560px]"
          />
        </div>
      </div>

      <Notes
        read={[
          "都道府県を選ぶと、その県だけを拡大し、県内の市区町村で色の区切りを付け直します。全国で見ると目立たない県内の差が見えます。",
          "地図や一覧で市区町村にふれると見出しに値が出ます。クリックで固定します。",
          "「人口あたり・割合」の分母は見出しに書いています（多くは2020年国勢調査の総人口）。",
        ]}
        caution={[...cautionsFor(ind), ...COMMON_CAUTIONS]}
      />
    </>
  );
}
