/**
 * サイト全体の目録。ナビ、トップのカード、各ページのヘッダーがここを見る。
 */

/** ページの深さ。トップは "."、a/〜f/ は ".."。各 HTML の data-root に書いてある。 */
export const ROOT = document.documentElement.dataset.root ?? ".";

export const url = (path: string) => `${ROOT}/${path}`;

export type SetId = "a" | "b" | "c" | "d" | "e" | "f";

export interface SetInfo {
  id: SetId;
  letter: string;
  dataset: string;
  name: string;
  grain: string;
  items: string;
  question: string;
  views: string[];
  original: string;
  pdf: string;
}

const FILES = "https://www.nstac.go.jp/files/";
export const csvUrl = (s: SetInfo) => `${FILES}${s.dataset}.csv`;
export const pdfUrl = (s: SetInfo) => `${FILES}${s.pdf}.pdf`;
export const setInfo = (id: SetId) => SETS.find((s) => s.id === id)!;

const SSDS = "総務省統計局「統計でみる都道府県・市区町村のすがた（社会・人口統計体系）」";

export const SETS: SetInfo[] = [
  {
    id: "a",
    letter: "A",
    dataset: "SSDSE-A-2026",
    name: "市区町村",
    grain: "1741市区町村",
    items: "125項目",
    question: "同じ県の中でも、市区町村はどれくらい違うか",
    views: ["地図", "県内のばらつき", "人口規模"],
    original: SSDS,
    pdf: "kaisetsu-A-2026",
  },
  {
    id: "b",
    letter: "B",
    dataset: "SSDSE-B-2026",
    name: "県別推移",
    grain: "47都道府県 × 12年度",
    items: "109項目",
    question: "この12年で、都道府県の順位は入れ替わったか",
    views: ["推移", "地域", "変化"],
    original: SSDS,
    pdf: "kaisetsu-B-2026",
  },
  {
    id: "c",
    letter: "C",
    dataset: "SSDSE-C-2026",
    name: "家計消費",
    grain: "全国・47都道府県庁所在市",
    items: "226項目",
    question: "どの都市で、何に食費を使っているか",
    views: ["品目", "地域", "都市"],
    original: "総務省統計局「家計調査」2023年〜2025年平均",
    pdf: "kaisetsu-C-2026",
  },
  {
    id: "d",
    letter: "D",
    dataset: "SSDSE-D-2023",
    name: "社会生活",
    grain: "全国・47都道府県 × 男女",
    items: "121項目",
    question: "1日の過ごし方と余暇は、男女と地域でどう違うか",
    views: ["生活時間", "行動者率", "地域"],
    original: "総務省統計局「令和3年社会生活基本調査」",
    pdf: "kaisetsu-D-2023",
  },
  {
    id: "e",
    letter: "E",
    dataset: "SSDSE-E-2026",
    name: "基本素材",
    grain: "全国・47都道府県",
    items: "93項目",
    question: "都道府県の姿を、93の項目から比べる",
    views: ["地域", "関係", "県プロフィール"],
    original: SSDS,
    pdf: "kaisetsu-E-2026",
  },
  {
    id: "f",
    letter: "F",
    dataset: "SSDSE-F-2023v3",
    name: "気候値",
    grain: "47地点 × 月・年",
    items: "42項目",
    question: "県庁所在地の季節は、どう違うか",
    views: ["季節", "地点", "地域"],
    original: "気象庁「地上気象観測統計」2020年平年値（1991〜2020年）第4.0.1版",
    pdf: "kaisetsu-F-2023v3",
  },
];
