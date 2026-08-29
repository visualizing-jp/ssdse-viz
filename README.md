# SSDSE 図版

独立行政法人統計センターの [SSDSE（教育用標準データセット）](https://www.nstac.go.jp/use/literacy/ssdse/) を素材にした、非公式の可視化ショーケースです。公式サイトではありません。

公開想定: GitHub Pages（静的 HTML、D3 v7）。

## ローカル確認

```bash
python3 -m http.server 8768 --bind 127.0.0.1
```

データを作り直す場合:

```bash
node scripts/build-data.js
```

公式 CSV は Shift-JIS です。リポジトリの `data/raw/` に版付きファイル名で置いてあります。

## 構成

| パス | 役割 |
| --- | --- |
| `index.html` | 入口のコロプレスと図版目録 |
| `exhibits/` | 8展示 |
| `scripts/build-data.js` | 公式CSV → 展示用JSON |
| `data/raw/` | 公式CSV（版止め） |
| `data/processed/` | 展示列だけのJSON |
| `data/geo/` | 都道府県・市区町村 TopoJSON |
| `vendor/d3.v7.min.js` | D3 v7.9.0 |

## 出典

独立行政法人 統計センター SSDSE（https://www.nstac.go.jp/use/literacy/ssdse/）を加工して作成。

版: SSDSE-A-2026 / B-2026 / C-2026 / D-2023 / E-2026 / F-2023v3。

地理データは国土交通省 国土数値情報（行政区域）を K-Oxon/Japan-map-for-BI が加工したもので、SSDSE とは分けて出典を書いています。
