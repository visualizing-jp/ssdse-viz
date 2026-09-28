/**
 * 2つの量の散布図。相関係数も添える（外れ値1点で大きく変わることは注記で断る）。
 */

import { extent } from "d3-array";
import { scaleLinear, scaleLog } from "d3-scale";
import { useMemo } from "react";
import { num } from "./format.ts";
import { useWidth } from "./useWidth.ts";

export interface Point {
  code: string;
  label: string;
  x: number | null;
  y: number | null;
  /** 強調したい点（例: 選んだ県に属する市区町村）。 */
  group?: boolean;
}

export function pearson(pts: { x: number; y: number }[]): number | null {
  const n = pts.length;
  if (n < 3) return null;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const p of pts) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  }
  return sxx === 0 || syy === 0 ? null : sxy / Math.sqrt(sxx * syy);
}

const M = { top: 12, right: 16, bottom: 40, left: 64 };

export function Scatter({
  points,
  xLabel,
  yLabel,
  logX = false,
  logY = false,
  focus,
  onHover,
  onPin,
  labelAll = true,
  height = 440,
}: {
  points: Point[];
  xLabel: string;
  yLabel: string;
  logX?: boolean;
  logY?: boolean;
  focus: string | null;
  onHover: (code: string | null) => void;
  onPin: (code: string) => void;
  labelAll?: boolean;
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const valid = useMemo(
    () =>
      points.filter(
        (p): p is Point & { x: number; y: number } =>
          p.x !== null && p.y !== null && Number.isFinite(p.x) && Number.isFinite(p.y) && (!logX || p.x > 0) && (!logY || p.y > 0),
      ),
    [points, logX, logY],
  );
  const w = Math.max(width, 280);
  const iw = w - M.left - M.right;
  const ih = height - M.top - M.bottom;
  const make = (log: boolean, dom: [number, number], range: [number, number]) => {
    const [lo, hi] = dom[0] === dom[1] ? [dom[0] - 1, dom[1] + 1] : dom;
    return log ? scaleLog().domain([lo, hi]).range(range).nice() : scaleLinear().domain([lo, hi]).range(range).nice();
  };
  const domain = (get: (p: { x: number; y: number }) => number): [number, number] => {
    const [lo, hi] = extent(valid, get);
    return lo === undefined || hi === undefined ? [0, 1] : [lo, hi];
  };
  const x = make(logX, domain((p) => p.x), [0, iw]);
  const y = make(logY, domain((p) => p.y), [ih, 0]);
  const r = pearson(logX || logY ? valid.map((p) => ({ x: logX ? Math.log(p.x) : p.x, y: logY ? Math.log(p.y) : p.y })) : valid);
  const focused = valid.find((p) => p.code === focus);
  const many = valid.length > 100;

  return (
    <div ref={ref} className="relative">
      <p className="tnum pb-1 text-[11px] text-muted">
        {valid.length}点 · 相関係数 r = {r === null ? "—" : r.toFixed(2)}
        {logX || logY ? "（対数軸では対数をとった値で計算）" : ""}
      </p>
      {width > 0 && (
        <svg width={w} height={height} role="img" aria-label={`${yLabel}と${xLabel}の散布図`} onMouseLeave={() => onHover(null)}>
          <g transform={`translate(${M.left},${M.top})`}>
            {x.ticks(6).map((t) => (
              <g key={`x${t}`} transform={`translate(${x(t)},0)`}>
                <line y2={ih} className="stroke-ink/10" />
                <text y={ih + 16} textAnchor="middle" className="tnum fill-muted text-[10px]">
                  {num(t, Math.abs(t) < 10 && !Number.isInteger(t) ? 1 : 0)}
                </text>
              </g>
            ))}
            {y.ticks(6).map((t) => (
              <g key={`y${t}`} transform={`translate(0,${y(t)})`}>
                <line x2={iw} className="stroke-ink/10" />
                <text x={-8} dy="0.32em" textAnchor="end" className="tnum fill-muted text-[10px]">
                  {num(t, Math.abs(t) < 10 && !Number.isInteger(t) ? 1 : 0)}
                </text>
              </g>
            ))}
            <text x={iw} y={ih + 34} textAnchor="end" className="fill-muted text-[11px]">
              {xLabel} →
            </text>
            <text x={0} y={-2} className="fill-muted text-[11px]" transform="translate(-56,0)">
              ↑ {yLabel}
            </text>
            {valid.map((p) => {
              const active = p.code === focus;
              return (
                <circle
                  key={p.code}
                  cx={x(p.x)}
                  cy={y(p.y)}
                  r={active ? 6 : many ? 2.4 : 4.5}
                  className={`cursor-pointer transition-[r] duration-150 ${
                    active ? "fill-accent stroke-ink" : p.group ? "fill-male/80 stroke-surface" : many ? "fill-fill-4/45" : "fill-fill-4/80 stroke-surface"
                  }`}
                  strokeWidth={many && !active ? 0 : 1}
                  onMouseEnter={() => onHover(p.code)}
                  onClick={() => onPin(p.code)}
                />
              );
            })}
            {labelAll &&
              !many &&
              valid.map((p) => (
                <text
                  key={`l${p.code}`}
                  x={x(p.x) + 6}
                  y={y(p.y) + 3}
                  className={`pointer-events-none text-[9px] ${p.code === focus ? "fill-ink font-semibold" : "fill-muted/80"}`}
                >
                  {p.label.replace(/[都府県]$/, "")}
                </text>
              ))}
            {focused && (many || !labelAll) && (
              <text x={x(focused.x) + 8} y={y(focused.y) - 8} className="pointer-events-none fill-ink text-[11px] font-semibold">
                {focused.label}
              </text>
            )}
          </g>
        </svg>
      )}
    </div>
  );
}
