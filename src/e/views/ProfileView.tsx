/**
 * 県プロフィール。1都道府県の全項目を、順位と47都道府県の中の位置で一覧にする。
 */

import { use, useMemo } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { withUnit } from "../../shared/format.ts";
import { effectiveMode, type Mode } from "../../shared/metric.ts";
import { Segmented } from "../../shared/Segmented.tsx";
import { Select } from "../../shared/Select.tsx";
import { ranks, valuesOf } from "../../shared/snapshot.ts";
import { Strip } from "../../shared/Strip.tsx";
import { setParam, useUrlState } from "../../shared/useUrlState.ts";
import { loadE, prefIndexes } from "../data.ts";

const FILTERS = [
  { value: "all" as const, label: "全項目" },
  { value: "edge" as const, label: "上位・下位5位だけ" },
];

export function ProfileView({ openMap }: { openMap: () => void }) {
  const data = use(loadE());
  const prefs = prefIndexes(data);
  const [area, setArea] = useUrlState("area", "13", (v) => data.areas.some((a) => a.code === v && v !== "00"));
  const [filter, setFilter] = useUrlState<"all" | "edge">("only", "all", (v) => v === "all" || v === "edge");
  const ai = data.areas.findIndex((a) => a.code === (area || "13"));
  const national = data.areas.findIndex((a) => a.code === "00");

  const rows = useMemo(
    () =>
      data.indicators.map((ind) => {
        const mode: Mode = effectiveMode(ind, "rate");
        const vals = valuesOf(data, ind, mode);
        const rank = ranks(vals, (i) => i !== national)[ai] ?? null;
        return { ind, mode, vals, rank };
      }),
    [data, ai, national],
  );
  const shown = filter === "all" ? rows : rows.filter((r) => r.rank !== null && (r.rank <= 5 || r.rank >= 43));

  const open = (code: string, mode: Mode) => {
    setParam("ind", code);
    setParam("mode", mode);
    openMap();
  };

  return (
    <ViewLayout>
      <ViewHeader
        title={`${data.areas[ai]!.label}のプロフィール`}
        meta="人口あたり・割合を作れる項目はその値で、作れない項目は実数で順位を付けています（1位が最大）。行をクリックすると地域ビューで開きます。"
      >
        <Select
          label="都道府県"
          value={area || "13"}
          onChange={setArea}
          options={prefs.map((i) => ({ value: data.areas[i]!.code, label: data.areas[i]!.label }))}
        />
        <Segmented label="表示する項目" options={FILTERS} value={filter} onChange={setFilter} />
      </ViewHeader>

      {data.groups.map((g) => {
        const items = shown.filter((r) => r.ind.group === g.id);
        if (items.length === 0) return null;
        return (
          <section key={g.id} className="pb-5">
            <h3 className="border-b border-ink/10 pb-1 text-[12px] font-semibold tracking-wide text-muted">{g.label}</h3>
            <table className="w-full text-[12px]">
              <tbody>
                {items.map(({ ind, mode, vals, rank }) => {
                  const unit = mode === "rate" ? ind.rate!.unit : ind.unit;
                  const edge = rank !== null && (rank <= 5 || rank >= 43);
                  return (
                    <tr
                      key={ind.code}
                      onClick={() => open(ind.code, mode)}
                      className="cursor-pointer border-b border-ink/5 transition-colors duration-150 hover:bg-ink/[0.04]"
                    >
                      <td className="py-1.5 pr-3 text-ink/90">
                        {ind.label}
                        <span className="ml-1.5 text-[10px] text-faint">
                          {ind.year}
                          {mode === "rate" ? ` · ${ind.rate!.label}` : ""}
                        </span>
                      </td>
                      <td className="tnum py-1.5 pr-3 text-right font-medium whitespace-nowrap">
                        {withUnit(vals[ai]!, unit)}
                      </td>
                      <td className="tnum py-1.5 pr-3 text-right whitespace-nowrap text-muted">
                        全国 {withUnit(vals[national]!, unit)}
                      </td>
                      <td
                        className={`tnum w-16 py-1.5 pr-3 text-right whitespace-nowrap ${
                          edge ? "font-semibold text-accent" : "text-muted"
                        }`}
                      >
                        {rank === null ? "—" : `${rank}位`}
                      </td>
                      <td className="w-[150px] py-1.5 max-md:hidden">
                        <Strip values={prefs.map((i) => vals[i]!)} focus={vals[ai]!} reference={vals[national]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}

      <Notes
        read={[
          "右端の点列は47都道府県の分布で、赤い点が選んだ都道府県、縦線が全国の値です。",
          "5位以内と43位以下を赤字にしています。「上位・下位5位だけ」で、その県が際立つ項目に絞れます。",
        ]}
        caution={[
          "順位は値の大きい順です。「大きいほど良い」とは限りません（死亡数、ごみ排出量など）。",
          "人口あたりの分母は総人口（2024年度）で、項目の年次とずれることがあります。",
          "家計の4項目は県庁所在市の値です。",
        ]}
      />
    </ViewLayout>
  );
}
