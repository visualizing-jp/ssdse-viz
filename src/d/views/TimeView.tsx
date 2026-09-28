/**
 * 生活時間ビュー。1日（1440分）を20の行動に分けた構成を、男女で並べる。
 */

import { use } from "react";
import { Notes, ViewHeader, ViewLayout } from "../../shared/DatasetPage.tsx";
import { clock, num } from "../../shared/format.ts";
import { Select } from "../../shared/Select.tsx";
import { useUrlState } from "../../shared/useUrlState.ts";
import { COMMON_CAUTIONS } from "../annotations.ts";
import { ACTIVITY_GROUPS, activityColor, at, loadD } from "../data.ts";

const hm = (min: number) => `${Math.floor(min / 60)}時間${String(Math.round(min % 60)).padStart(2, "0")}分`;

export function TimeView() {
  const data = use(loadD());
  const [area, setArea] = useUrlState("area", "00", (v) => data.areas.some((a) => a.code === v));
  const ai = data.areas.findIndex((a) => a.code === area);
  const label = (code: string) => data.indicators.find((i) => i.code === code)!.label;
  const codes = ACTIVITY_GROUPS.flatMap((g) => g.codes);
  const sum = (sex: number, list: string[]) => list.reduce((s, c) => s + (at(data, c, sex, ai) ?? 0), 0);
  const maxGap = Math.max(...codes.map((c) => Math.abs((at(data, c, 2, ai) ?? 0) - (at(data, c, 1, ai) ?? 0))));

  return (
    <ViewLayout>
      <ViewHeader
        title={`${data.areas[ai]!.label}の1日`}
        meta={
          <>
            10歳以上・週全体の1日あたり平均時間。平日の平均時刻：起床 男 {clock(at(data, "MH01", 1, ai))} / 女{" "}
            {clock(at(data, "MH01", 2, ai))} · 就寝 男 {clock(at(data, "MH04", 1, ai))} / 女 {clock(at(data, "MH04", 2, ai))}
          </>
        }
      >
        <Select
          label="地域"
          value={area}
          onChange={setArea}
          options={data.areas.map((a) => ({ value: a.code, label: a.label }))}
        />
      </ViewHeader>

      <section className="space-y-3 pb-6">
        {[1, 2, 0].map((sex) => (
          <div key={sex}>
            <div className="flex items-baseline justify-between pb-1 text-[12px]">
              <span className="font-semibold">{data.sexes[sex]}</span>
              <span className="tnum text-muted">
                {ACTIVITY_GROUPS.map((g) => `${g.label} ${hm(sum(sex, g.codes))}`).join(" · ")}
              </span>
            </div>
            <div className="flex h-7 overflow-hidden rounded-[3px]">
              {codes.map((c) => {
                const v = at(data, c, sex, ai) ?? 0;
                return (
                  <div
                    key={c}
                    title={`${label(c)} ${v}分`}
                    className="h-full border-r border-surface/60 last:border-r-0"
                    style={{ width: `${(v / 1440) * 100}%`, background: activityColor(c) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="tnum flex justify-between text-[10px] text-faint">
          <span>0分</span>
          <span>360</span>
          <span>720</span>
          <span>1080</span>
          <span>1440分</span>
        </div>
      </section>

      <section>
        <h3 className="pb-2 text-[12px] font-semibold text-muted">行動ごとの男女差（女 − 男、分）</h3>
        <table className="w-full text-[12px]">
          <thead className="text-[11px] text-faint">
            <tr className="border-b border-ink/10">
              <th className="py-1 text-left font-normal">行動</th>
              <th className="py-1 text-right font-normal">男</th>
              <th className="py-1 text-right font-normal">女</th>
              <th className="w-2/5 py-1 pl-4 text-left font-normal">
                <span className="text-male">← 男が長い</span> · <span className="text-accent">女が長い →</span>
              </th>
            </tr>
          </thead>
          {ACTIVITY_GROUPS.map((g) => (
            <tbody key={g.id}>
              <tr>
                <td colSpan={4} className="pt-3 pb-1 text-[10px] tracking-wide text-faint">
                  {g.label}
                </td>
              </tr>
              {g.codes.map((c) => {
                const m = at(data, c, 1, ai) ?? 0;
                const f = at(data, c, 2, ai) ?? 0;
                const gap = f - m;
                const w = maxGap > 0 ? (Math.abs(gap) / maxGap) * 50 : 0;
                return (
                  <tr key={c} className="border-b border-ink/5">
                    <td className="py-1">
                      <span aria-hidden className="mr-2 inline-block size-2.5 rounded-[2px] align-middle" style={{ background: activityColor(c) }} />
                      {label(c)}
                    </td>
                    <td className="tnum py-1 text-right">{m}</td>
                    <td className="tnum py-1 text-right">{f}</td>
                    <td className="py-1 pl-4">
                      <div className="relative h-3">
                        <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink/30" />
                        <span
                          aria-hidden
                          className={`absolute inset-y-0.5 rounded-[2px] ${gap >= 0 ? "bg-accent/70" : "bg-male/70"}`}
                          style={gap >= 0 ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }}
                        />
                        <span
                          className={`tnum absolute top-1/2 -translate-y-1/2 text-[10px] ${gap >= 0 ? "text-accent" : "text-male"}`}
                          style={gap >= 0 ? { left: `calc(50% + ${w}% + 4px)` } : { right: `calc(50% + ${w}% + 4px)` }}
                        >
                          {gap > 0 ? "+" : ""}
                          {num(gap, 0)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </section>

      <Notes
        read={[
          "帯は1日の1440分を20の行動で分けたものです。濃い緑が1次活動（睡眠・身の回りの用事・食事）、赤系が2次活動（仕事・家事など義務的な活動）、青系が3次活動（自由に使える時間）です。",
          "下の表は同じ行動の男女差です。仕事と家事・育児で向きが逆になるかどうかを見てください。",
          "地域を切り替えると、都道府県ごとの1日と比べられます。",
        ]}
        caution={[
          "総平均なので、その行動をしなかった人も0分として平均に入っています。「育児をする人の育児時間」ではありません。",
          "20行動の合計は丸めのため1440分から数分ずれることがあります。",
          ...COMMON_CAUTIONS,
        ]}
      />
    </ViewLayout>
  );
}
