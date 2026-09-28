/**
 * 地点ビュー。1地点の雨温図（降水量の棒と気温の帯）と、年の値の一覧を47地点の中の位置つきで出す。
 */

import { scaleBand, scaleLinear } from "d3-scale";
import { area, line } from "d3-shape";
import { use } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { num, withUnit } from "../../shared/format.ts";
import { Select } from "../../shared/Select.tsx";
import { ranks } from "../../shared/snapshot.ts";
import { Strip } from "../../shared/Strip.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { useWidth } from "../../shared/useWidth.ts";
import type { ClimateData } from "../../shared/types.ts";
import { COMMON_CAUTIONS } from "../annotations.ts";
import { loadF, MONTHS, YEAR } from "../data.ts";

const M = { top: 16, right: 48, bottom: 26, left: 48 };
const H = 320;

function Climograph({ data, ai, compare }: { data: ClimateData; ai: number; compare: number | null }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const w = Math.max(width, 320);
  const iw = w - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const month = (code: string, i: number) => data.values[code]![i]!.slice(0, 12).map((v) => v ?? 0);
  const rain = month("CN500", ai);
  const tmax = month("CN110", ai);
  const tmin = month("CN120", ai);
  const tavg = month("CN100", ai);
  const cavg = compare !== null ? month("CN100", compare) : null;
  const crain = compare !== null ? month("CN500", compare) : null;
  const x = scaleBand<number>().domain(MONTHS).range([0, iw]).padding(0.25);
  const allRain = data.values.CN500!.flatMap((r) => r.slice(0, 12).map((v) => v ?? 0));
  const allT = ["CN110", "CN120"].flatMap((c) => data.values[c]!.flatMap((r) => r.slice(0, 12).map((v) => v ?? 0)));
  const yr = scaleLinear().domain([0, Math.max(...allRain)]).range([ih, 0]).nice();
  const yt = scaleLinear().domain([Math.min(...allT), Math.max(...allT)]).range([ih, 0]).nice();
  const cx = (m: number) => x(m)! + x.bandwidth() / 2;
  const band = area<number>()
    .x((_, m) => cx(m))
    .y0((_, m) => yt(tmin[m]!))
    .y1((_, m) => yt(tmax[m]!));
  const avg = line<number>()
    .x((_, m) => cx(m))
    .y((v) => yt(v));

  return (
    <div ref={ref}>
      {width > 0 && (
        <svg width={w} height={H} role="img" aria-label="雨温図">
          <g transform={`translate(${M.left},${M.top})`}>
            {yt.ticks(6).map((t) => (
              <g key={`t${t}`} transform={`translate(0,${yt(t)})`}>
                <line x2={iw} className={t === 0 ? "stroke-ink/30" : "stroke-ink/10"} />
                <text x={-8} dy="0.32em" textAnchor="end" className="tnum fill-accent text-[10px]">
                  {t}℃
                </text>
              </g>
            ))}
            {yr.ticks(5).map((t) => (
              <text key={`r${t}`} x={iw + 8} y={yr(t)} dy="0.32em" className="tnum fill-male text-[10px]">
                {t}
              </text>
            ))}
            <text x={iw + 8} y={-6} className="fill-male text-[10px]">
              mm
            </text>
            {MONTHS.map((m) => (
              <g key={m}>
                <rect x={x(m)} y={yr(rain[m]!)} width={x.bandwidth() / (crain ? 2 : 1)} height={ih - yr(rain[m]!)} className="fill-male/55" />
                {crain && (
                  <rect
                    x={x(m)! + x.bandwidth() / 2}
                    y={yr(crain[m]!)}
                    width={x.bandwidth() / 2}
                    height={ih - yr(crain[m]!)}
                    className="fill-male/25"
                  />
                )}
                <text x={cx(m)} y={ih + 16} textAnchor="middle" className="tnum fill-muted text-[10px]">
                  {m + 1}月
                </text>
              </g>
            ))}
            <path d={band(tavg) ?? ""} className="fill-accent/15" />
            <path d={avg(tavg) ?? ""} fill="none" className="stroke-accent" strokeWidth={2.2} />
            {tavg.map((v, m) => (
              <circle key={m} cx={cx(m)} cy={yt(v)} r={2.6} className="fill-accent" />
            ))}
            {cavg && <path d={avg(cavg) ?? ""} fill="none" className="stroke-ink/60" strokeWidth={1.5} strokeDasharray="4 3" />}
          </g>
        </svg>
      )}
    </div>
  );
}

export function CityView() {
  const data = use(loadF());
  const valid = (v: string) => data.areas.some((a) => a.code === v);
  const [area, setArea] = useUrlState("area", "13", valid);
  const [cmp, setCmp] = useUrlState("vs", "", (v) => v === "" || valid(v));
  const ai = data.areas.findIndex((a) => a.code === area);
  const ci = cmp === "" ? null : data.areas.findIndex((a) => a.code === cmp);
  const a = data.areas[ai]!;
  const options = data.areas.map((x) => ({ value: x.code, label: `${x.label}（${x.pref}）` }));

  return (
    <ViewLayout>
      <ViewHeader
        title={`${a.label}（${a.pref}）の気候`}
        meta={`北緯 ${num(a.lat!, 2)}° · 東経 ${num(a.lon!, 2)}° · 標高 ${num(a.alt!, 1)} m`}
      >
        <Select label="地点" value={area} onChange={setArea} options={options} />
        <span className="text-[12px] text-faint">と比べる</span>
        <Select label="比べる地点" value={cmp} onChange={setCmp} options={[{ value: "", label: "なし" }, ...options]} />
      </ViewHeader>

      <Climograph data={data} ai={ai} compare={ci} />
      <p className="pt-1 text-[11px] text-muted">
        <span className="text-accent">赤線</span>＝平均気温、帯＝日最低気温の平均〜日最高気温の平均、
        <span className="text-male">青い棒</span>＝降水量（右軸）
        {ci !== null && `。破線と薄い棒は${data.areas[ci]!.label}`}。縦軸は47地点共通なので、地点を替えても比べられます。
      </p>

      <section className="pt-6">
        <h3 className="pb-2 text-[12px] font-semibold text-muted">年の値と47地点の中の位置</h3>
        {data.groups.map((g) => (
          <div key={g.id} className="pb-3">
            <p className="border-b border-ink/10 pb-1 text-[11px] tracking-wide text-faint">{g.label}</p>
            <table className="w-full text-[12px]">
              <tbody>
                {data.indicators
                  .filter((i) => i.group === g.id)
                  .map((ind) => {
                    const year = data.values[ind.code]!.map((r) => r[YEAR]!);
                    const rank = ranks(year, () => true)[ai];
                    return (
                      <tr key={ind.code} className="border-b border-ink/5">
                        <td className="py-1 pr-3">{ind.label}</td>
                        <td className="tnum py-1 pr-3 text-right whitespace-nowrap">{withUnit(year[ai]!, ind.unit)}</td>
                        <td className="tnum w-20 py-1 pr-3 text-right text-muted">{rank}位</td>
                        <td className="w-[150px] py-1 max-md:hidden">
                          <Strip values={year} focus={year[ai]!} />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <Notes
        read={[
          "雨温図は、平均気温（線）と、日最高・日最低気温の平均の幅（帯）、月降水量（棒）を重ねたものです。",
          "下の一覧は年の値です。順位は大きい順で、右の点列の赤い点がこの地点です。",
        ]}
        caution={COMMON_CAUTIONS}
      />
    </ViewLayout>
  );
}
