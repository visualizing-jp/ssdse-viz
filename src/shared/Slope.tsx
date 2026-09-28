/**
 * 2時点の比較。順位モードでは47行に等間隔に並べるので、すべての名前が読める。
 * 値モードでは縦軸が値になり、名前は注目する1つだけ出す。
 */

import { scaleLinear } from "d3-scale";
import { short } from "./format.ts";
import { useWidth } from "./useWidth.ts";

export interface SlopeRow {
  code: string;
  label: string;
  from: number | null;
  to: number | null;
}

const ROW = 15;

export function Slope({
  rows,
  byRank,
  fromLabel,
  toLabel,
  format,
  focus,
  onHover,
  onPin,
}: {
  rows: SlopeRow[];
  byRank: boolean;
  fromLabel: string;
  toLabel: string;
  format: (v: number | null) => string;
  focus: string | null;
  onHover: (code: string | null) => void;
  onPin: (code: string) => void;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const valid = rows.filter((r): r is SlopeRow & { from: number; to: number } => r.from !== null && r.to !== null);
  const rankOf = (key: "from" | "to") => {
    const sorted = [...valid].sort((a, b) => b[key] - a[key]);
    return new Map(sorted.map((r, i) => [r.code, i + 1]));
  };
  const rf = rankOf("from");
  const rt = rankOf("to");
  const n = valid.length;
  const height = byRank ? n * ROW + 40 : 460;
  const labelW = Math.min(150, Math.max(96, width * 0.2));
  const x0 = labelW;
  const x1 = Math.max(width - labelW, x0 + 120);
  const values = valid.flatMap((r) => [r.from, r.to]);
  const vy = scaleLinear()
    .domain([Math.min(...values), Math.max(...values)])
    .range([height - 16, 28])
    .nice();
  const yFrom = (r: (typeof valid)[number]) => (byRank ? 28 + (rf.get(r.code)! - 1) * ROW : vy(r.from));
  const yTo = (r: (typeof valid)[number]) => (byRank ? 28 + (rt.get(r.code)! - 1) * ROW : vy(r.to));
  const moved = (r: (typeof valid)[number]) => rf.get(r.code)! - rt.get(r.code)!;

  return (
    <div ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={`${fromLabel}と${toLabel}の比較`} onMouseLeave={() => onHover(null)}>
          <text x={x0} y={12} textAnchor="middle" className="fill-muted text-[11px] font-semibold">
            {fromLabel}
          </text>
          <text x={x1} y={12} textAnchor="middle" className="fill-muted text-[11px] font-semibold">
            {toLabel}
          </text>
          {valid.map((r) => {
            const active = r.code === focus;
            const up = r.to > r.from;
            const big = byRank && Math.abs(moved(r)) >= 8;
            return (
              <g
                key={r.code}
                className="cursor-pointer"
                onMouseEnter={() => onHover(r.code)}
                onClick={() => onPin(r.code)}
                opacity={focus && !active ? 0.6 : 1}
              >
                <line
                  x1={x0}
                  x2={x1}
                  y1={yFrom(r)}
                  y2={yTo(r)}
                  className={active ? "stroke-accent" : big ? "stroke-accent/70" : up ? "stroke-fill-4" : "stroke-male/60"}
                  strokeWidth={active ? 2.6 : 1.2}
                />
                <circle cx={x0} cy={yFrom(r)} r={2.5} className="fill-ink/60" />
                <circle cx={x1} cy={yTo(r)} r={2.5} className="fill-ink/60" />
                {(byRank || active) && (
                  <>
                    <text x={x0 - 8} y={yFrom(r)} dy="0.32em" textAnchor="end" className={`tnum text-[10px] ${active ? "fill-ink font-semibold" : "fill-muted"}`}>
                      {short(r.label)} {format(r.from)}
                    </text>
                    <text x={x1 + 8} y={yTo(r)} dy="0.32em" className={`tnum text-[10px] ${active ? "fill-ink font-semibold" : "fill-muted"}`}>
                      {format(r.to)} {short(r.label)}
                      {byRank && moved(r) !== 0 ? ` ${moved(r) > 0 ? "↑" : "↓"}${Math.abs(moved(r))}` : ""}
                    </text>
                  </>
                )}
                <line x1={x0} x2={x1} y1={yFrom(r)} y2={yTo(r)} stroke="transparent" strokeWidth={10} />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
