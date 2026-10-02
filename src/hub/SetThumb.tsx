import { ChartColumn, ChartLine, Clock, CloudSun, Map, Utensils, type LucideIcon } from "lucide-react";
import type { SetId } from "../shared/site.ts";

/** 各セットの問いが、一目で分かる線画。 */
const ICONS: Record<SetId, LucideIcon> = {
  a: Map,
  b: ChartLine,
  c: Utensils,
  d: Clock,
  e: ChartColumn,
  f: CloudSun,
};

/**
 * 目次カードのサムネイル。Lucide の 24 グリッドを大きく描いても、
 * nonScalingStroke で線は画面上 1px のままにする。
 */
export function SetThumb({ id }: { id: SetId }) {
  const Icon = ICONS[id];
  return (
    <div className="flex aspect-[8/3] shrink-0 items-center justify-center bg-[color-mix(in_oklab,var(--color-fill-1)_46%,white)]">
      <span className="set-thumb-mark inline-flex">
        <Icon className="h-20 w-20 text-ink" strokeWidth={1} nonScalingStroke />
      </span>
    </div>
  );
}
