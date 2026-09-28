import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";

/** 項目リストの右端に置く小さな推移線。形だけを見せるので軸は描かない。 */
export function Spark({ values, width = 56, height = 18 }: { values: (number | null)[]; width?: number; height?: number }) {
  const pts = values.map((v, i) => ({ i, v })).filter((p): p is { i: number; v: number } => p.v !== null);
  if (pts.length < 2) return <svg width={width} height={height} aria-hidden />;
  const x = scaleLinear()
    .domain([0, values.length - 1])
    .range([1, width - 1]);
  const lo = Math.min(...pts.map((p) => p.v));
  const hi = Math.max(...pts.map((p) => p.v));
  const y = scaleLinear()
    .domain(lo === hi ? [lo - 1, hi + 1] : [lo, hi])
    .range([height - 2, 2]);
  const d = line<{ i: number; v: number }>()
    .x((p) => x(p.i))
    .y((p) => y(p.v))(pts);
  return (
    <svg width={width} height={height} aria-hidden className="shrink-0 text-fill-4 opacity-80">
      <path d={d ?? ""} fill="none" stroke="currentColor" strokeWidth={1.2} />
    </svg>
  );
}
