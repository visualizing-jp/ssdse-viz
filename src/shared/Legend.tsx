import type { ColorScale } from "./scales.ts";

export function Legend({ scale, caption }: { scale: ColorScale; caption?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[10px] text-muted">
      {caption && <span className="text-faint">{caption}</span>}
      {scale.legend.map((s, i) => (
        <span key={i} className="tnum inline-flex items-center gap-1 whitespace-nowrap">
          <span aria-hidden className="inline-block h-2.5 w-4 rounded-[2px] border border-ink/10" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}
