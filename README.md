# SSDSE 図版

独立行政法人統計センターの [SSDSE（教育用標準データセット）](https://www.nstac.go.jp/use/literacy/ssdse/) を素材にした、非公式の可視化ショーケースです。公式サイトではありません。

A〜F の各セットに1ページずつ、3つの切り口（`?view=`）を用意しています。見ている項目・地域・年などはすべて URL に残るので、そのまま共有できます。

| ページ | セット | 切り口 |
| --- | --- | --- |
| `a/` | SSDSE-A-2026 市区町村 | 地図 / 県内のばらつき / 人口規模 |
| `b/` | SSDSE-B-2026 県別推移 | 推移 / 地域 / 変化 |
| `c/` | SSDSE-C-2026 家計消費 | 品目 / 地域 / 都市 |
| `d/` | SSDSE-D-2023 社会生活 | 生活時間 / 行動者率 / 地域 |
| `e/` | SSDSE-E-2026 基本素材 | 地域 / 関係 / 県プロフィール |
| `f/` | SSDSE-F-2023v3 気候値 | 季節 / 地点 / 地域 |

React + Vite + TypeScript + Tailwind CSS。D3 はモジュール（array / scale / shape / geo）だけ使います。GitHub Pages に静的配信します（`.github/workflows/pages.yml`）。

## 開発

```bash
npm install
npm run data      # data/raw の公式CSV → public/data
npm run verify    # 解説PDFの見本値・項目数・内訳の和を検算
npm run dev
npm run build
npm run typecheck
```

`npm run data -- --set=e` で1セットだけ作り直せます。公式 CSV は Shift-JIS で、`data/raw/` に版付きファイル名で置いています。

データ設計（単位・年次・分母・留意点）の正本は [`docs/data-sources.md`](docs/data-sources.md)。

## 構成

| パス | 役割 |
| --- | --- |
| `index.html`・`about.html`・`{a..f}/index.html` | 各ページの入口（`data-root` でページの深さを持つ） |
| `src/shared/` | ナビ・フッター・ページ枠・タイル地図・順位・散布図などの共通部品 |
| `src/hub/`・`src/about/`・`src/{a..f}/` | ページごとの画面 |
| `scripts/build.ts`・`scripts/sets/` | 公式CSV → 配信JSON |
| `scripts/verify.ts` | 検算 |
| `data/raw/` | 公式CSV（版止め） |
| `public/data/` | 配信JSON（A は項目ごとに分割） |
| `public/geo/` | 都道府県・市区町村 TopoJSON |

## 出典

独立行政法人 統計センター SSDSE（https://www.nstac.go.jp/use/literacy/ssdse/）を加工して作成。

版: SSDSE-A-2026 / B-2026 / C-2026 / D-2023 / E-2026 / F-2023v3。

地理データは国土交通省 国土数値情報（行政区域）を K-Oxon/Japan-map-for-BI が加工したもので、SSDSE とは分けて出典を書いています。
