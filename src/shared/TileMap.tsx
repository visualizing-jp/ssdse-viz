/**
 * 都道府県のタイル地図。面積の大きい県が目立ちすぎないよう、升目で1県1マスにする。
 */

import { short } from "./format.ts";
import type { ColorScale } from "./scales.ts";

const LAYOUT = [
  "........................01",
  "........................02",
  "......................0503",
  "......................0604",
  "....................1507..",
  "..............171620100908",
  "..............1821..111312",
  "....3231..2625..23221914..",
  "..35343328272924..........",
  "404438373630..............",
  "4143..39..................",
  "424645....................",
  "..........................",
  "47........................",
];
const COLS = 13;

export interface Tile {
  code: string;
  label: string;
  value: number | null;
  text: string;
}

export function TileMap({
  tiles,
  scale,
  hovered,
  onHover,
  pinned,
  onPin,
}: {
  tiles: Tile[];
  scale: ColorScale;
  hovered: string | null;
  onHover: (code: string | null) => void;
  pinned: string | null;
  onPin: (code: string | null) => void;
}) {
  const byCode = new Map(tiles.map((t) => [t.code, t]));
  return (
    <div className="-mx-2 overflow-x-auto px-2">
      <div
        className="grid aspect-[13/14] max-w-[680px] min-w-[520px] gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${LAYOUT.length}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => onHover(null)}
      >
        {LAYOUT.flatMap((row, ri) =>
          Array.from({ length: COLS }, (_, ci) => {
            const cell = row.slice(ci * 2, ci * 2 + 2);
            const tile = byCode.get(cell);
            if (tile === undefined) return null;
            const active = pinned === tile.code || hovered === tile.code;
            const dark = scale.dark(tile.value);
            return (
              <button
                key={tile.code}
                type="button"
                style={{ gridColumn: ci + 1, gridRow: ri + 1, backgroundColor: scale.fill(tile.value) }}
                className={`cursor-pointer overflow-hidden rounded-[3px] border text-left transition-[box-shadow,transform] duration-150 ease-out ${
                  active ? "z-10 scale-[1.06] border-ink/60 shadow-md" : "border-transparent hover:border-ink/25"
                } ${dark ? "text-fill-0" : "text-ink"}`}
                onMouseEnter={() => onHover(tile.code)}
                onFocus={() => onHover(tile.code)}
                onClick={() => onPin(pinned === tile.code ? null : tile.code)}
                aria-pressed={pinned === tile.code}
                aria-label={`${tile.label} ${tile.text}`}
              >
                <span className="block truncate px-0.5 pt-0.5 text-[9px] leading-none opacity-85">{short(tile.label)}</span>
                <span className="tnum block truncate px-0.5 text-[10px] leading-tight font-medium">{tile.text}</span>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
