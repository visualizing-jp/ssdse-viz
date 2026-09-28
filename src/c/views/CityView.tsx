/**
 * 都市ビュー。1都市の食費の配分を全国と比べる（特化係数）。
 */

import { use, useMemo } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { RatioBars } from "../../shared/RatioBars.tsx";
import { Select } from "../../shared/Select.tsx";
import { setParam, useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS, HOUSEHOLD_NOTE } from "../annotations.ts";
import { cityIndexes, loadC, NATIONAL, specialization } from "../data.ts";

const TOP = 15;

export function CityView({ openItem }: { openItem: () => void }) {
  const data = use(loadC());
  const cities = cityIndexes(data);
  const [area, setArea] = useUrlState("area", "01", (v) => v !== "00" && data.areas.some((a) => a.code === v));
  const ai = data.areas.findIndex((a) => a.code === (area || "01"));
  const city = data.areas[ai]!;

  const classes = data.indicators.filter((i) => i.parent === "LB00");
  const items = useMemo(
    () =>
      data.indicators
        .filter((i) => i.parent !== undefined && i.parent !== "LB00")
        .map((i) => ({ ind: i, s: specialization(data, i.code, ai) }))
        .filter((r): r is { ind: (typeof r)["ind"]; s: number } => r.s !== null),
    [data, ai],
  );
  const high = [...items].sort((a, b) => b.s - a.s).slice(0, TOP);
  const low = [...items].sort((a, b) => a.s - b.s).slice(0, TOP);
  const classLabel = (code: string) => data.indicators.find((i) => i.code === code)?.label ?? "";
  const open = (code: string) => {
    setParam("ind", code);
    openItem();
  };
  const food = data.values.LB00!;

  return (
    <ViewLayout>
      <ViewHeader
        title={`${city.label}（${city.pref}）の食卓`}
        meta={
          <>
            食料（合計） {withUnit(food[ai]!, "円")}（全国 {withUnit(food[NATIONAL]!, "円")}） · 世帯人員{" "}
            {num(data.values.LA03![ai]!, 2)}人（全国 {num(data.values.LA03![NATIONAL]!, 2)}人）
          </>
        }
      >
        <Select
          label="都市"
          value={area || "01"}
          onChange={setArea}
          options={cities.map((i) => ({ value: data.areas[i]!.code, label: `${data.areas[i]!.label}（${data.areas[i]!.pref}）` }))}
        />
      </ViewHeader>

      <section className="pb-6">
        <h3 className="pb-2 text-[12px] font-semibold text-muted">中分類の配分（食料支出に占める割合と特化係数）</h3>
        <table className="w-full text-[12px]">
          <thead className="text-[11px] text-faint">
            <tr className="border-b border-ink/10">
              <th className="py-1 text-left font-normal">中分類</th>
              <th className="py-1 text-right font-normal">{city.label}</th>
              <th className="py-1 text-right font-normal">全国</th>
              <th className="w-1/2 py-1 pl-4 text-left font-normal">特化係数</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.code} className="border-b border-ink/5">
                <td className="py-1">{c.label}</td>
                <td className="tnum py-1 text-right">{num((data.values[c.code]![ai]! / food[ai]!) * 100, 1)}%</td>
                <td className="tnum py-1 text-right text-muted">
                  {num((data.values[c.code]![NATIONAL]! / food[NATIONAL]!) * 100, 1)}%
                </td>
                <td className="py-1 pl-4">
                  <RatioBars
                    rows={[{ code: c.code, label: "", ratio: specialization(data, c.code, ai) }]}
                    onSelect={open}
                    limit={2}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">全国より多く振り向けている品目 上位{TOP}</h3>
          <RatioBars
            rows={high.map((r) => ({ code: r.ind.code, label: r.ind.label, ratio: r.s, note: classLabel(r.ind.parent!) }))}
            onSelect={open}
            limit={4}
          />
        </section>
        <section>
          <h3 className="pb-2 text-[12px] font-semibold text-muted">全国より少ない品目 上位{TOP}</h3>
          <RatioBars
            rows={low.map((r) => ({ code: r.ind.code, label: r.ind.label, ratio: r.s, note: classLabel(r.ind.parent!) }))}
            onSelect={open}
            limit={4}
          />
        </section>
      </div>

      <Notes
        read={[
          "特化係数は「この都市の食料支出に占めるその品目の割合」を「全国の同じ割合」で割ったものです。×1.00 が全国並み、×2.00 なら全国の2倍の比重です。",
          "金額ではなく割合どうしを比べるので、食費全体の多い都市・少ない都市でも、何に重きを置いているかを比べられます。",
          "品目をクリックすると、品目ビューでその品目の47都市の分布を開きます。",
        ]}
        caution={[
          "全国での支出がごく小さい品目は、少しの差で係数が大きく振れます。",
          HOUSEHOLD_NOTE,
          ...COMMON_CAUTIONS,
        ]}
      />
    </ViewLayout>
  );
}
