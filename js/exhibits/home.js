import { observe, rootPrefix, yen, reducedMotion } from "../theme.js";
import { renderPrefMap } from "../charts/choropleth.js";

const root = rootPrefix();

async function loadJson(name) {
  const res = await fetch(`${root}/data/processed/${name}`);
  return res.json();
}

export async function drawHero(el, legendEl) {
  const [data, topo] = await Promise.all([
    loadJson("exhibit-c.json"),
    fetch(`${root}/data/geo/ja_prefecture_area.topojson`).then((r) => r.json())
  ]);
  const values = new Map(data.rows.map((d) => [d.prefCode, d.beef]));
  const draw = (dims) => {
    renderPrefMap(el, topo, values, { width: dims.width, height: Math.max(dims.height, 520) }, {
      mode: "quantile",
      animate: true,
      legendEl,
      tip: (f, v) => {
        const name = f.properties.prefecture_name;
        const row = data.rows.find((d) => d.prefCode === (f.id || f.properties.prefecture_code));
        if (v == null) return name;
        return `${row.city}（${name}）<br>牛肉 ${yen(v)}`;
      }
    });
  };
  observe(el, draw);
  if (reducedMotion()) return;
}

const hero = document.querySelector("[data-hero-map]");
if (hero) drawHero(hero, document.querySelector("[data-hero-legend]"));
