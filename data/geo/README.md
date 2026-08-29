# 地理データ

SSDSE 本体とは別出典です。

- ファイル: `ja_prefecture_area.topojson`, `ja_municipality_area_5.topojson`
- 加工元: [K-Oxon/Japan-map-for-BI](https://github.com/K-Oxon/Japan-map-for-BI)（簡素化・1741市区町村に結合）
- 原典: 国土交通省 [国土数値情報（行政区域データ）](https://nlftp.mlit.go.jp/ksj/)
- 利用: 政府標準利用規約に準拠 / [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

市区町村の `id` / `lg_code_5` は全国地方公共団体コード（5桁）で、SSDSE-A の地域コードから先頭の `R` を除いた値と結合します。
