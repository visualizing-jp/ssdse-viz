import type { Indicator } from "../shared/types.ts";

/** 項目ごとの注意。kaisetsu-E-2026 の「データ利用上の留意点」と別表による。 */
export function cautionsFor(ind: Indicator): string[] {
  const out: string[] = [];
  if (ind.capital) {
    out.push(
      "家計の4項目は都道府県全体ではなく、県庁所在市（東京都は区部）の二人以上の世帯の月間消費支出の年平均値です（家計調査に都道府県別の集計がないため）。",
    );
  }
  if (ind.rate && ind.rate.den === "A1101" && ind.year !== "2024") {
    out.push(
      `人口あたりの分母は総人口（2024年度）です。この項目の年次（${ind.year}年度）とずれているので、厳密な率ではなく目安として見てください。`,
    );
  }
  if (ind.code === "G5101v2") out.push("映画館数は社会・人口統計体系には含まれず、経済センサス－活動調査の産業小分類別結果によります。");
  if (/^C21|^C22/.test(ind.code)) out.push("経済センサスの事業所数・従業者数は民営で、個人経営の農林漁家を含みません。");
  return out;
}

export const COMMON_CAUTIONS = [
  "年次は項目ごとに違います（見出しの年度を確認してください）。国勢調査年以外の人口は人口推計です。",
  "色分けは47都道府県を7つの分位に分けたものです。隣り合う色の差が小さい値の差であることもあります。",
];
