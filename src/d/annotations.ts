import type { Indicator } from "../shared/types.ts";

/** kaisetsu-D-2023 の別表と「データ利用上の留意点」による。 */
export function cautionsFor(ind: Indicator): string[] {
  const out: string[] = [];
  const g = ind.group;
  if (["MB", "MC", "MD", "ME", "MF"].includes(g)) {
    out.push("行動者率は、10歳以上のうち過去1年間（2020年10月20日〜2021年10月19日）にその活動をした人の割合です。");
  }
  if (g === "MC" || g === "MD") {
    out.push("スポーツと趣味・娯楽の一部は、ある県の男または女で行動者がいない「－」を、SSDSE では便宜的に 0 にしています。");
  }
  if (g === "MG") {
    out.push("生活時間は、10歳以上の週全体の1日あたり総平均時間（その行動をしなかった人も含めた平均）です。");
  }
  if (ind.code === "MG51") out.push("MG51 は平日に通勤・通学をした人だけの平均（行動者平均）です。");
  if (ind.code === "MG52") out.push("MG52 は15歳以上の有業者の週全体の平均です。");
  if (ind.code === "MG53") out.push("MG53 は10歳以上の在学者の平日の平均です。");
  if (g === "MH") {
    out.push("平均時刻は平日の値です。起床・朝食・夕食・就寝は10歳以上、出勤・帰宅は15歳以上の有業者です。");
  }
  if (ind.code === "MA00") out.push("推定人口は10歳以上で、単位は千人です。");
  return out;
}

export const COMMON_CAUTIONS = [
  "令和3年社会生活基本調査（2021年10月20日現在）の結果です。調査は5年ごとで、前回の版（SSDSE-D-2021）は2016年の調査です。",
  "生活時間と平均時刻は、10月16日〜24日の9日間のうちの2日間について、時間帯ごとの行動を記録したものです。",
];
