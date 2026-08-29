import { observe, rootPrefix, pct } from "../theme.js";
import { renderCanvasMap } from "../charts/canvas-map.js";

const root = rootPrefix();
const el = document.querySelector("[data-muni-map]");
const legendEl = document.querySelector("[data-legend]");
const [data, topo] = await Promise.all([
  fetch(`${root}/data/processed/exhibit-a.json`).then((r) => r.json()),
  fetch(`${root}/data/geo/ja_municipality_area_5.topojson`).then((r) => r.json())
]);
const byCode = new Map(data.rows.map((d) => [d.muniCode, d]));
const values = new Map(data.rows.map((d) => [d.muniCode, d.agingPct]));

observe(el, (dims) => {
  renderCanvasMap(el, topo, values, { width: dims.width, height: Math.max(dims.height, 280) }, {
    mode: "quantile",
    legendEl,
    tip: (f, v) => {
      const id = f.properties.lg_code_5 || f.id;
      const row = byCode.get(id);
      const name = row ? `${row.name}（${row.pref}）` : f.properties.city_name;
      if (v == null) return `${name}<br>データなし`;
      return `${name}<br>65歳以上 ${pct(v)} / 人口 ${row.pop.toLocaleString("ja-JP")}`;
    }
  });
});
