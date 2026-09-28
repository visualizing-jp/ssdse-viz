import { loadJson } from "../shared/load.ts";
import type { SnapshotData } from "../shared/types.ts";

export const loadE = () => loadJson<SnapshotData>("data/e.json");

export const DEFAULT_IND = "I6100";

/** 都道府県だけ（全国を除く）の行番号。 */
export const prefIndexes = (data: SnapshotData) =>
  data.areas.map((a, i) => (a.code === "00" ? -1 : i)).filter((i) => i >= 0);
