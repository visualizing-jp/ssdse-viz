import type { Indicator } from "../shared/types.ts";

/** kaisetsu-B-2026 の「データ利用上の留意点」による項目別の注意。 */
export function cautionsFor(ind: Indicator): string[] {
  const out: string[] = [];
  if (/^B41/.test(ind.code)) {
    out.push("気象の5項目は県庁所在市の気象台等の観測値です（東京都は千代田区、埼玉県は熊谷市、滋賀県は彦根市）。");
  }
  if (ind.code === "B4106" || ind.code === "B4109") {
    out.push(
      "2022年の宇都宮市の降水日数・降水量、2021年の富山市の降水量は、社会・人口統計体系では欠測ですが、気象庁の「資料不足値」を収録しています。",
    );
  }
  if (/^L32/.test(ind.code)) {
    out.push("家計の11項目は県庁所在市（東京都は区部）の、二人以上の世帯の月間消費支出の年平均値です。");
  }
  if (/^A1/.test(ind.code)) {
    out.push("人口は国勢調査年（2015・2020年）は国勢調査、それ以外の年は人口推計です。年の境目で段差が出ることがあります。");
  }
  return out;
}

export const COMMON_CAUTIONS = [
  "年は社会・人口統計体系の表記に合わせた年度です。項目によって暦年・年度・調査時点の違いがあります。",
  "B には全国の行がありません。基準線は47都道府県の中央値で、全国平均ではありません。",
];
