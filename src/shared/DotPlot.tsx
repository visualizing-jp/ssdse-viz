/**
 * 1次元の分布。点が重ならないよう段をずらして積む（簡易ビースウォーム）。
 * 両端の数点と注目点には名前を付ける。
 */

import { scaleLinear } from "d3-scale";
import { num, short } from "./format.ts";
import { useWidth } from "./useWidth.ts";

export interface Dot {
  code: string;
  label: string;
  value: number | null;
}

const R = 4.5;
const M = { left: 16, right: 16 };

export function DotPlot({
  dots,
  reference,
  referenceLabel,
  focus,
  onHover,
  onPin,
  format = (v) => num(v),
  labelEnds = 3,
}: {
  dots: Dot[];
  reference?: number | null;
  referenceLabel?: string;
  focus: string | null;
  onHover: (code: string | null) => void;
  onPin: (code: string) => void;
  format?: (v: number) => string;
  labelEnds?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const valid = dots.filter((d): d is Dot & { value: number } => d.value !== null).sort((a, b) => a.value - b.value);
  const all = valid.map((d) => d.value).concat(reference ?? []);
  const x = scaleLinear()
    .domain([Math.min(...all), Math.max(...all)])
    .range([M.left, Math.max(width - M.right, M.left + 10)])
    .nice();

  const levels: number[][] = [];
  const placed = valid.map((d) => {
    const px = x(d.value);
    let lvl = 0;
    while ((levels[lvl] ?? []).some((q) => Math.abs(q - px) < R * 2 + 0.5)) lvl++;
    (levels[lvl] ??= []).push(px);
    return { ...d, px, lvl };
  });
  const depth = Math.max(1, levels.length);
  const base = 26;
  const height = base + depth * (R * 2 + 1) + 44;
  const cy = (lvl: number) => base + (depth - 1 - lvl) * (R * 2 + 1) + R;
  const named = new Set([
    ...valid.slice(0, labelEnds).map((d) => d.code),
    ...valid.slice(-labelEnds).map((d) => d.code),
  ]);

  return (
    <div ref={ref}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="分布" onMouseLeave={() => onHover(null)}>
          {x.ticks(6).map((t) => (
            <g key={t} transform={`translate(${x(t)},0)`}>
              <line y1={base - 6} y2={height - 34} className="stroke-ink/10" />
              <text y={height - 20} textAnchor="middle" className="tnum fill-muted text-[10px]">
                {format(t)}
              </text>
            </g>
          ))}
          {reference !== undefined && reference !== null && (
            <g transform={`translate(${x(reference)},0)`}>
              <line y1={base - 12} y2={height - 34} className="stroke-ink" strokeDasharray="3 3" />
              <text y={base - 16} textAnchor="middle" className="fill-ink text-[10px]">
                {referenceLabel} {format(reference)}
              </text>
            </g>
          )}
          {placed.map((d) => {
            const active = d.code === focus;
            return (
              <g key={d.code} onMouseEnter={() => onHover(d.code)} onClick={() => onPin(d.code)} className="cursor-pointer">
                <circle
                  cx={d.px}
                  cy={cy(d.lvl)}
                  r={active ? R + 1.5 : R}
                  className={active ? "fill-accent stroke-ink" : "fill-fill-4/75 stroke-surface"}
                  strokeWidth={1}
                />
              </g>
            );
          })}
          {placed
            .filter((d) => named.has(d.code) || d.code === focus)
            .map((d) => (
              <text
                key={`l${d.code}`}
                x={d.px}
                y={height - 6}
                textAnchor="middle"
                className={`pointer-events-none text-[10px] ${d.code === focus ? "fill-accent font-semibold" : "fill-muted"}`}
              >
                {short(d.label)}
              </text>
            ))}
        </svg>
      )}
    </div>
  );
}
