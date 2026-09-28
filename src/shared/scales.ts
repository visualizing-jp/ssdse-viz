import { scaleLinear, scaleQuantile } from "d3-scale";

export const SEQ = ["#e8f2ed", "#c5ddd4", "#8fb9ae", "#5a9188", "#2f6b70", "#1a4a52", "#122f38"];
export const NODATA = "#c5cdc8";
const BELOW = "#2a5f8a";
const ABOVE = "#c4472a";
const MIDDLE = "#eef3f0";

export interface ColorScale {
  fill: (v: number | null) => string;
  /** 濃い塗りの上では文字を白にする。 */
  dark: (v: number | null) => boolean;
  legend: { color: string; label: string }[];
}

/**
 * 7階級の分位。47都道府県のように数が少ないと等間隔では外れ値に色を持っていかれるので、
 * 並び順で塗り分ける。
 */
export function quantileScale(values: (number | null)[], format: (v: number) => string): ColorScale {
  const v = values.filter((x): x is number => x !== null && Number.isFinite(x));
  if (v.length === 0) return { fill: () => NODATA, dark: () => false, legend: [] };
  const s = scaleQuantile<string>().domain(v).range(SEQ);
  const q = s.quantiles();
  const idx = (x: number) => SEQ.indexOf(s(x));
  return {
    fill: (x) => (x === null || !Number.isFinite(x) ? NODATA : s(x)),
    dark: (x) => x !== null && Number.isFinite(x) && idx(x) >= 4,
    legend: SEQ.map((color, i) => ({
      color,
      label: i === 0 ? `〜${format(q[0]!)}` : i === SEQ.length - 1 ? `${format(q[i - 1]!)}〜` : format(q[i - 1]!),
    })),
  };
}

/** 全国＝1 を中心にした比。対数で上下を対称にする。 */
export function ratioScale(range = 1.5): ColorScale {
  const s = scaleLinear<string>()
    .domain([-Math.log(range), 0, Math.log(range)])
    .range([BELOW, MIDDLE, ABOVE])
    .clamp(true);
  const at = (x: number) => s(Math.log(x));
  return {
    fill: (x) => (x === null || !(x > 0) ? NODATA : at(x)),
    dark: (x) => x !== null && x > 0 && Math.abs(Math.log(x)) > Math.log(range) * 0.7,
    legend: [1 / range, 1 / Math.sqrt(range), 1, Math.sqrt(range), range].map((x) => ({
      color: at(x),
      label: `×${x.toFixed(2)}`,
    })),
  };
}
