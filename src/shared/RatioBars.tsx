/**
 * 1 を中心にした比の横棒。対数で左右を対称にする（×2 と ×0.5 が同じ長さ）。
 */

export interface RatioRow {
  code: string;
  label: string;
  ratio: number | null;
  note?: string;
}

export function RatioBars({
  rows,
  onSelect,
  selected,
  limit = 2.5,
}: {
  rows: RatioRow[];
  onSelect?: (code: string) => void;
  selected?: string;
  limit?: number;
}) {
  const max = Math.log(limit);
  const labeled = rows.some((r) => r.label !== "");
  return (
    <ul className="space-y-px">
      {rows.map((r) => {
        const l = r.ratio !== null && r.ratio > 0 ? Math.max(-max, Math.min(max, Math.log(r.ratio))) : 0;
        const pct = (Math.abs(l) / max) * 50;
        const active = r.code === selected;
        return (
          <li key={r.code}>
            <button
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(r.code)}
              className={`grid w-full items-center gap-2 rounded-md px-2 py-0.5 text-left text-[12px] transition-colors duration-150 enabled:cursor-pointer enabled:hover:bg-ink/[0.04] ${
                labeled ? "grid-cols-[minmax(0,11rem)_1fr_3.6rem]" : "grid-cols-[1fr_3.6rem]"
              } ${active ? "bg-ink/[0.08]" : ""}`}
            >
              {labeled && (
                <span className={`truncate ${active ? "font-semibold text-ink" : "text-muted"}`} title={r.label}>
                  {r.label}
                  {r.note && <span className="ml-1 text-[10px] text-faint">{r.note}</span>}
                </span>
              )}
              <span className="relative h-3">
                <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-ink/30" />
                <span
                  aria-hidden
                  className={`absolute inset-y-0.5 rounded-[2px] ${l >= 0 ? "bg-accent/70" : "bg-male/65"}`}
                  style={l >= 0 ? { left: "50%", width: `${pct}%` } : { right: "50%", width: `${pct}%` }}
                />
              </span>
              <span className="tnum text-right text-ink">{r.ratio === null ? "—" : `×${r.ratio.toFixed(2)}`}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
