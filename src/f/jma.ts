/**
 * 気象庁「ホームページにおける気象情報の配色に関する設定指針」
 * https://www.jma.go.jp/jma/kishou/info/colorguide/HPColorGuide_202007.pdf
 * （平成24年5月／令和2年7月一部改訂）
 *
 * 色そのものは指針の RGB をそのまま使う。
 * 階級の閾値は、指針が想定する時雨量・日照率ではなく、SSDSE-F の月別平年値（mm / 時間）に合わせて割り当てている。
 */

import { scaleThreshold } from "d3-scale";
import type { ColorScale } from "../shared/scales.ts";

const rgb = (r: number, g: number, b: number) => `rgb(${r},${g},${b})`;

/** 表２－１ 基本配色（低→高）。 */
const RAIN = [
  rgb(242, 242, 255),
  rgb(160, 210, 255),
  rgb(33, 140, 255),
  rgb(0, 65, 255),
  rgb(250, 245, 0),
  rgb(255, 153, 0),
  rgb(255, 40, 0),
  rgb(180, 0, 104),
];
/** アメダス日照時間（低→高）。 */
const SUN = [rgb(0, 65, 255), rgb(185, 235, 255), rgb(250, 245, 0), rgb(255, 153, 0), rgb(255, 40, 0), rgb(180, 0, 104)];

const RAIN_MONTHLY = [50, 100, 150, 200, 300, 400, 500];
const SUN_MONTHLY = [60, 100, 140, 180, 220];

/** `dark` は白文字にする階級の番号（低い方から0始まり）。 */
function threshold(colors: string[], breaks: number[], unit: string, dark: number[]): ColorScale {
  const s = scaleThreshold<number, string>().domain(breaks).range(colors);
  const edges = [0, ...breaks];
  return {
    fill: (v) => (v === null ? "#c5cdc8" : s(v)),
    dark: (v) => v !== null && dark.includes(colors.indexOf(s(v))),
    legend: colors.map((color, i) => ({
      color,
      label: i === colors.length - 1 ? `${edges[i]}${unit}以上` : i === 0 ? `${breaks[0]}${unit}未満` : `${edges[i]}–${breaks[i]}${unit}`,
    })),
  };
}

export const jmaRainMonthly = () => threshold(RAIN, RAIN_MONTHLY, "mm", [2, 3, 6, 7]);
export const jmaSunMonthly = () => threshold(SUN, SUN_MONTHLY, "h", [0, 4, 5]);
