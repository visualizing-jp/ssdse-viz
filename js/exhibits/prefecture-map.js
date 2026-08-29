import { observe, rootPrefix, yen } from "../theme.js";
import { renderPrefMap } from "../charts/choropleth.js";

const root = rootPrefix();
const el = document.querySelector("[data-pref-map]");
const legendEl = document.querySelector("[data-legend]");
let mode = "quantile";
const [data, topo] = await Promise.all([
  fetch(`${root}/data/processed/exhibit-c.json`).then((r) => r.json()),
  fetch(`${root}/data/geo/ja_prefecture_area.topojson`).then((r) => r.json())
]);
const values = new Map(data.rows.map((d) => [d.prefCode, d.beef]));

function draw(dims) {
  renderPrefMap(el, topo, values, { width: dims.width, height: Math.max(dims.height, 280) }, {
    mode,
    legendEl,
    tip: (f, v) => {
      const id = f.id || f.properties.prefecture_code;
      const row = data.rows.find((d) => d.prefCode === id);
      if (!row || v == null) return f.properties.prefecture_name;
      return `${row.city}（${row.pref}）<br>牛肉 ${yen(v)}`;
    }
  });
}

observe(el, draw);

document.querySelectorAll("[data-class-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.classMode;
    document.querySelectorAll("[data-class-mode]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    draw({ width: el.clientWidth, height: el.clientHeight });
  });
});
