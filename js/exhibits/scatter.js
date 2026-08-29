import { observe, rootPrefix, yen } from "../theme.js";
import { renderScatter } from "../charts/scatter.js";

const root = rootPrefix();
const data = await (await fetch(`${root}/data/processed/exhibit-c.json`)).json();
const el = document.querySelector("[data-scatter]");
const points = data.rows.map((d) => ({
  x: d.beef,
  y: d.pork,
  label: d.city,
  pref: d.pref,
  color: "#2a5f8a"
}));

observe(el, (dims) =>
  renderScatter(el, points, dims, {
    xLabel: data.columns.beef.label,
    yLabel: data.columns.pork.label,
    tip: (d) => `${d.label}（${d.pref}）<br>牛肉 ${yen(d.x)} / 豚肉 ${yen(d.y)}`
  })
);
