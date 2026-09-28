/**
 * 値の大きい順の一覧。棒の長さで差の大きさも読めるようにする。
 */

export interface RankRow {
  code: string;
  label: string;
  value: number | null;
  text: string;
  sub?: string;
}

export function Ranking({
  rows,
  highlighted,
  onHover,
  onSelect,
  ascending = false,
  maxHeight = "max-h-[460px]",
}: {
  rows: RankRow[];
  highlighted: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
  ascending?: boolean;
  maxHeight?: string;
}) {
  const ranked = rows
    .filter((r) => r.value !== null)
    .sort((a, b) => (ascending ? a.value! - b.value! : b.value! - a.value!));
  const max = Math.max(...ranked.map((r) => Math.abs(r.value!)), 0);
  return (
    <ol className={`${maxHeight} space-y-px overflow-y-auto pr-1`} onMouseLeave={() => onHover(null)}>
      {ranked.map((r, i) => {
        const active = highlighted === r.code;
        return (
          <li key={r.code}>
            <button
              type="button"
              onMouseEnter={() => onHover(r.code)}
              onFocus={() => onHover(r.code)}
              onClick={() => onSelect(r.code)}
              className={`relative flex w-full cursor-pointer items-baseline gap-2 overflow-hidden rounded-md px-2 py-1 text-left text-[12px] transition-colors duration-150 ${
                active ? "bg-ink/[0.08]" : "hover:bg-ink/[0.04]"
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-1 left-0 -z-0 rounded-r-[2px] ${active ? "bg-accent/25" : "bg-fill-2/35"}`}
                style={{ width: max > 0 ? `${(Math.abs(r.value!) / max) * 100}%` : 0 }}
              />
              <span className="tnum relative w-6 shrink-0 text-faint">{i + 1}</span>
              <span className={`relative min-w-0 truncate ${active ? "font-semibold text-ink" : "text-muted"}`}>{r.label}</span>
              <span className="tnum relative ml-auto shrink-0 font-medium text-ink">{r.text}</span>
              {r.sub !== undefined && <span className="tnum relative w-12 shrink-0 text-right text-[11px] text-faint">{r.sub}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
