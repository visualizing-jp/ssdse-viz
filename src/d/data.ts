import { loadJson } from "../shared/load.ts";
import type { SexData } from "../shared/types.ts";

export const loadD = () => loadJson<SexData>("data/d.json");

export const NATIONAL = 0;
export const SEXES = [
  { value: "0" as const, label: "総数" },
  { value: "1" as const, label: "男" },
  { value: "2" as const, label: "女" },
];
export type SexKey = (typeof SEXES)[number]["value"];

/**
 * 20の行動を3つの活動にまとめる（令和3年社会生活基本調査「用語の解説」28 行動の種類）。
 * 1次活動＝生理的に必要な活動、2次活動＝義務的な性格の強い活動、3次活動＝自由に使える時間の活動。
 */
export const ACTIVITY_GROUPS = [
  { id: "1", label: "1次活動", codes: ["MG01", "MG02", "MG03"] },
  { id: "2", label: "2次活動", codes: ["MG04", "MG05", "MG06", "MG07", "MG08", "MG09", "MG10"] },
  {
    id: "3",
    label: "3次活動",
    codes: ["MG11", "MG12", "MG13", "MG14", "MG15", "MG16", "MG17", "MG18", "MG19", "MG20"],
  },
];

const TONES: Record<string, string[]> = {
  "1": ["#122f38", "#1a4a52", "#2f6b70"],
  "2": ["#7a2a18", "#9c3a22", "#c4472a", "#d46a4f", "#e08c74", "#eaae9b", "#f2cfc3"],
  "3": ["#2a5f8a", "#3b74a0", "#5089b3", "#679dc4", "#80b1d3", "#9ac3df", "#b3d3e8", "#c9e0ef", "#dcebf5", "#ebf3f9"],
};

export function activityColor(code: string): string {
  for (const g of ACTIVITY_GROUPS) {
    const i = g.codes.indexOf(code);
    if (i >= 0) return TONES[g.id]![i]!;
  }
  return "#c5cdc8";
}

export const at = (data: SexData, code: string, sex: number, area: number) => data.values[code]![sex]![area] ?? null;
