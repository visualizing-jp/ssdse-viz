/**
 * 1行に収まる分布。全地域の値を点で並べ、注目する1地域だけ色を付ける。
 */

export function Strip({
  values,
  focus,
  reference,
  width = 140,
  height = 16,
}: {
  values: (number | null)[];
  focus: number | null;
  /** 全国などの基準値。縦線で描く。 */
  reference?: number | null;
  width?: number;
  height?: number;
}) {
  const v = values.filter((x): x is number => x !== null && Number.isFinite(x));
  if (v.length === 0) return <svg width={width} height={height} aria-hidden />;
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  const x = (d: number) => (hi === lo ? width / 2 : 3 + ((d - lo) / (hi - lo)) * (width - 6));
  return (
    <svg width={width} height={height} aria-hidden className="shrink-0">
      <line x1={3} x2={width - 3} y1={height / 2} y2={height / 2} className="stroke-ink/15" />
      {reference !== undefined && reference !== null && Number.isFinite(reference) && (
        <line x1={x(reference)} x2={x(reference)} y1={2} y2={height - 2} className="stroke-muted" strokeWidth={1} />
      )}
      {v.map((d, i) => (
        <circle key={i} cx={x(d)} cy={height / 2} r={1.8} className="fill-fill-4/35" />
      ))}
      {focus !== null && Number.isFinite(focus) && (
        <circle cx={x(focus)} cy={height / 2} r={3.6} className="fill-accent stroke-surface" strokeWidth={1} />
      )}
    </svg>
  );
}
