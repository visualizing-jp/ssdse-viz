/**
 * 気象庁「ホームページにおける気象情報の配色に関する設定指針」
 * https://www.jma.go.jp/jma/kishou/info/colorguide/HPColorGuide_202007.pdf
 * （平成24年5月／令和2年7月一部改訂）
 *
 * 色そのものは指針の RGB をそのまま使う。
 * 階級の閾値は、指針が想定する時雨量・日照率ではなく、
 * SSDSE-F の月別平年値（mm / 時間）に合わせて割り当てている。
 */

import { d3 } from "./theme.js";

function rgb(r, g, b) {
  return `rgb(${r},${g},${b})`;
}

/** 表２－１ 基本配色（高→低の並び） */
export const JMA_RAIN_HIGH_TO_LOW = [
  rgb(180, 0, 104),
  rgb(255, 40, 0),
  rgb(255, 153, 0),
  rgb(250, 245, 0),
  rgb(0, 65, 255),
  rgb(33, 140, 255),
  rgb(160, 210, 255),
  rgb(242, 242, 255)
];

/** アメダス日照時間（高→低の並び） */
export const JMA_SUN_HIGH_TO_LOW = [
  rgb(180, 0, 104),
  rgb(255, 40, 0),
  rgb(255, 153, 0),
  rgb(250, 245, 0),
  rgb(185, 235, 255),
  rgb(0, 65, 255)
];

/**
 * 月降水量（mm）用。表２－１の8色を、月平年値の幅に合わせて閾値化。
 * 閾値は「以上」の下限（d3.scaleThreshold の domain）。
 */
export const JMA_RAIN_MONTHLY_BREAKS = [50, 100, 150, 200, 300, 400, 500];

/**
 * 月日照時間（h）用。アメダス日照の6色を月積算時間向けに閾値化。
 */
export const JMA_SUN_MONTHLY_BREAKS = [60, 100, 140, 180, 220];

export function jmaRainScale() {
  const colors = [...JMA_RAIN_HIGH_TO_LOW].reverse();
  return d3.scaleThreshold().domain(JMA_RAIN_MONTHLY_BREAKS).range(colors);
}

export function jmaSunScale() {
  const colors = [...JMA_SUN_HIGH_TO_LOW].reverse();
  return d3.scaleThreshold().domain(JMA_SUN_MONTHLY_BREAKS).range(colors);
}

export function jmaLegendStops(metric) {
  if (metric === "sun") {
    const colors = [...JMA_SUN_HIGH_TO_LOW].reverse();
    const edges = [0, ...JMA_SUN_MONTHLY_BREAKS, null];
    return colors.map((color, i) => {
      const lo = edges[i];
      const hi = edges[i + 1];
      const label = hi == null ? `${lo}h以上` : i === 0 ? `${hi}h未満` : `${lo}–${hi}h`;
      return { color, label };
    });
  }
  const colors = [...JMA_RAIN_HIGH_TO_LOW].reverse();
  const edges = [0, ...JMA_RAIN_MONTHLY_BREAKS, null];
  return colors.map((color, i) => {
    const lo = edges[i];
    const hi = edges[i + 1];
    const label = hi == null ? `${lo}mm以上` : i === 0 ? `${hi}mm未満` : `${lo}–${hi}mm`;
    return { color, label };
  });
}
