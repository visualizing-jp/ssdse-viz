/**
 * 多数の系列を細線で重ね、注目する1系列と基準線（中央値など）だけを太く描く折れ線。
 * マウスに最も近い系列を拾うので、47本あっても狙った線にふれられる。
 */

import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { useMemo, type MouseEvent } from "react";
import { num } from "./format.ts";
import { useWidth } from "./useWidth.ts";

export interface Series {
  code: string;
  label: string;
  values: (number | null)[];
}

const M = { top: 14, right: 88, bottom: 28, left: 60 };

export function LineChart({
  xs,
  series,
  reference,
  referenceLabel,
  focus,
  onHover,
  onPin,
  format = (v) => num(v),
  height = 420,
}: {
  xs: number[];
  series: Series[];
  reference?: (number | null)[];
  referenceLabel?: string;
  focus: string | null;
  onHover: (code: string | null) => void;
  onPin: (code: string) => void;
  format?: (v: number) => string;
  height?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const w = Math.max(width, 320);
  const iw = w - M.left - M.right;
  const ih = height - M.top - M.bottom;
  const all = useMemo(
    () => series.flatMap((s) => s.values).concat(reference ?? []).filter((v): v is number => v !== null),
    [series, reference],
  );
  const [lo, hi] = extent(all);
  const x = scaleLinear()
    .domain([xs[0]!, xs.at(-1)!])
    .range([0, iw]);
  const y = scaleLinear()
    .domain(lo === undefined || hi === undefined ? [0, 1] : lo === hi ? [lo - 1, hi + 1] : [lo, hi])
    .range([ih, 0])
    .nice();
  const path = line<number | null>()
    .defined((v) => v !== null)
    .x((_, i) => x(xs[i]!))
    .y((v) => y(v!));

  const nearest = (e: MouseEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    const i = Math.max(0, Math.min(xs.length - 1, Math.round((px / iw) * (xs.length - 1))));
    let best: string | null = null;
    let dist = Infinity;
    for (const s of series) {
      const v = s.values[i];
      if (v === null || v === undefined) continue;
      const d = Math.abs(y(v) - py);
      if (d < dist) {
        dist = d;
        best = s.code;
      }
    }
    onHover(dist < 24 ? best : null);
  };

  const focused = series.find((s) => s.code === focus);
  const last = (vals: (number | null)[]) => {
    for (let i = vals.length - 1; i >= 0; i--) if (vals[i] !== null) return { i, v: vals[i]! };
    return null;
  };

  return (
    <div ref={ref}>
      {width > 0 && (
        <svg width={w} height={height} role="img" aria-label="推移の折れ線">
          <g transform={`translate(${M.left},${M.top})`}>
            {y.ticks(6).map((t) => (
              <g key={t} transform={`translate(0,${y(t)})`}>
                <line x2={iw} className="stroke-ink/10" />
                <text x={-8} dy="0.32em" textAnchor="end" className="tnum fill-muted text-[10px]">
                  {format(t)}
                </text>
              </g>
            ))}
            {xs.map((t, i) => (
              <text
                key={t}
                x={x(t)}
                y={ih + 18}
                textAnchor="middle"
                className={`tnum fill-muted text-[10px] ${xs.length > 8 && i % 2 === 1 && i !== xs.length - 1 ? "max-sm:hidden" : ""}`}
              >
                {t}
              </text>
            ))}
            {series.map((s) => (
              <path
                key={s.code}
                d={path(s.values) ?? ""}
                fill="none"
                className={s.code === focus ? "stroke-transparent" : "stroke-fill-4/25"}
                strokeWidth={1}
              />
            ))}
            {reference && (
              <>
                <path d={path(reference) ?? ""} fill="none" className="stroke-ink" strokeWidth={1.6} strokeDasharray="4 3" />
                {(() => {
                  const l = last(reference);
                  return l ? (
                    <text x={x(xs[l.i]!) + 6} y={y(l.v)} dy="0.32em" className="fill-ink text-[10px]">
                      {referenceLabel}
                    </text>
                  ) : null;
                })()}
              </>
            )}
            {focused && (
              <>
                <path d={path(focused.values) ?? ""} fill="none" className="stroke-accent" strokeWidth={2.4} />
                {focused.values.map((v, i) =>
                  v === null ? null : <circle key={i} cx={x(xs[i]!)} cy={y(v)} r={2.6} className="fill-accent" />,
                )}
                {(() => {
                  const l = last(focused.values);
                  return l ? (
                    <text x={x(xs[l.i]!) + 6} y={y(l.v)} dy="0.32em" className="fill-accent text-[11px] font-semibold">
                      {focused.label}
                    </text>
                  ) : null;
                })()}
              </>
            )}
            <rect
              width={iw}
              height={ih}
              fill="transparent"
              className="cursor-crosshair"
              onMouseMove={nearest}
              onMouseLeave={() => onHover(null)}
              onClick={() => focus && onPin(focus)}
            />
          </g>
        </svg>
      )}
    </div>
  );
}
