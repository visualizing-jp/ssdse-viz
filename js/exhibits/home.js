import { d3, observe, rootPrefix, yen, reducedMotion } from "../theme.js";
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

const plates = document.querySelectorAll(".plate-thumb[data-series]");
if (plates.length) {
  loadJson("exhibit-c.json").then((data) => {
    plates.forEach((el) => {
      const key = el.dataset.series;
      const svg = d3.create("svg").attr("viewBox", "0 0 120 40").style("width", "100%").style("height", "100%");
      if (key === "map") {
        el.replaceChildren();
        return;
      }
      const vals = data.rows.map((d) => d[key]).filter((d) => d != null);
      const x = d3.scaleLinear().domain([0, vals.length - 1]).range([4, 116]);
      const y = d3.scaleLinear().domain(d3.extent(vals)).range([34, 6]);
      const sorted = [...vals].sort(d3.ascending);
      svg
        .append("path")
        .attr(
          "d",
          d3.line().x((_, i) => x(i)).y((d) => y(d))(sorted)
        )
        .attr("fill", "none")
        .attr("stroke", "#1a4a52")
        .attr("stroke-width", 1.4);
      el.replaceChildren(svg.node());
    });
  });
}

const hero = document.querySelector("[data-hero-map]");
if (hero) drawHero(hero, document.querySelector("[data-hero-legend]"));
