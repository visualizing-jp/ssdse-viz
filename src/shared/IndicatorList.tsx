/**
 * 分野ごとに見出しを立てた項目の選定リスト。項目が100を超えるので絞り込み欄を付ける。
 */

import { useMemo, useState, type ReactNode } from "react";
import type { Group, Indicator } from "./types.ts";

export function IndicatorList({
  groups,
  indicators,
  selected,
  onSelect,
  title = "項目",
  aside,
  indent,
}: {
  groups: Group[];
  indicators: Indicator[];
  selected: string;
  onSelect: (code: string) => void;
  title?: string;
  /** 行の右端に添えるもの（スパークラインなど）。 */
  aside?: (ind: Indicator) => ReactNode;
  /** 内訳の項目を字下げする。 */
  indent?: (ind: Indicator) => boolean;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const byGroup = useMemo(() => {
    const hits = q === "" ? indicators : indicators.filter((i) => i.label.includes(q) || i.code.includes(q.toUpperCase()));
    return groups
      .map((g) => ({ group: g, items: hits.filter((i) => i.group === g.id) }))
      .filter((g) => g.items.length > 0);
  }, [groups, indicators, q]);

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between pb-2">
        <p className="text-[11px] text-faint">{title}</p>
        <p className="tnum text-[11px] text-faint">{indicators.length}</p>
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="項目名で絞り込む"
        aria-label="項目名で絞り込む"
        className="mb-2 w-full rounded-md border border-rule bg-surface px-2.5 py-1.5 text-[12px] placeholder:text-faint"
      />
      {byGroup.length === 0 && <p className="px-2 py-3 text-[12px] text-faint">該当する項目がありません</p>}
      {byGroup.map(({ group, items }) => (
        <div key={group.id} className="pb-1">
          <p className="pt-2 pb-1 text-[10px] tracking-wide text-faint">{group.label}</p>
          {items.map((ind) => {
            const active = ind.code === selected;
            return (
              <button
                key={ind.code}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(ind.code)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 text-left transition-colors duration-150 ${
                  indent?.(ind) ? "pl-5" : "pl-2"
                } ${active ? "bg-ink/[0.08]" : "hover:bg-ink/[0.04]"}`}
              >
                <span
                  className={`min-w-0 flex-1 text-[12px] leading-snug ${active ? "font-semibold text-ink" : "text-muted"}`}
                >
                  {ind.label}
                </span>
                {aside?.(ind)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
