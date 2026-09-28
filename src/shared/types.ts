/**
 * 配信 JSON の形。scripts/ のビルドと src/ の画面が同じ型を見る。
 */

/** 実数から「人口あたり」「割合」を作る方法。分母は同じセットの項目コード。 */
export interface Rate {
  den: string;
  scale: number;
  unit: string;
  label: string;
}

export interface Indicator {
  code: string;
  label: string;
  unit: string;
  /** 収録年次。セット全体で1つのとき（C・D・F）は null。 */
  year: string | null;
  group: string;
  rate?: Rate;
  /** 県庁所在市などの値で、都道府県全体の値ではない項目。 */
  capital?: boolean;
  /** C の品目だけ。所属する中分類のコード。 */
  parent?: string;
  /** D の平均時刻。値は 0 時からの分。 */
  clock?: boolean;
}

export interface Group {
  id: string;
  label: string;
}

export interface Area {
  /** 都道府県は2桁、市区町村は5桁。全国は "00"。 */
  code: string;
  label: string;
  /** 都道府県名（市のデータで使う）。 */
  pref?: string;
  lat?: number;
  lon?: number;
  alt?: number;
}

export interface Source {
  dataset: string;
  title: string;
  original: string;
  csv: string;
  pdf: string;
}

interface Base {
  source: Source;
  groups: Group[];
  indicators: Indicator[];
  areas: Area[];
}

/** E: 全国＋47都道府県 × 項目。values[code][area]。 */
export interface SnapshotData extends Base {
  values: Record<string, (number | null)[]>;
}

/** B: 47都道府県 × 年 × 項目。values[code][year][area]。 */
export interface SeriesData extends Base {
  years: number[];
  values: Record<string, (number | null)[][]>;
}

/** D: 男女の別 × 全国＋47都道府県 × 項目。values[code][sex][area]。 */
export interface SexData extends Base {
  sexes: string[];
  values: Record<string, (number | null)[][]>;
}

/** F: 47地点 × 月（1〜12）と年 × 項目。values[code][area][period]。 */
export interface ClimateData extends Base {
  periods: string[];
  values: Record<string, (number | null)[][]>;
}

/** A: 市区町村は項目ごとに別ファイル（values/{code}.json）で配る。 */
export interface MuniMeta extends Base {
  prefs: Area[];
}
