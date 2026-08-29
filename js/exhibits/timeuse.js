import { observe, rootPrefix } from "../theme.js";
import { renderBars } from "../charts/bar.js";
import { renderScatter } from "../charts/scatter.js";

const root = rootPrefix();
const data = await (await fetch(`${root}/data/processed/exhibit-d.json`)).json();
const rankEl = document.querySelector("[data-gap-rank]");
const scatterEl = document.querySelector("[data-gap-scatter]");

const ranked = data.rows
  .map((d) => ({
    label: d.pref,
    value: d.houseworkGap,
    male: d.male.housework,
    female: d.female.housework
  }))
  .sort((a, b) => b.value - a.value);

observe(rankEl, (dims) =>
  renderBars(rankEl, ranked, dims, {
    tickFormat: (d) => `${d}`,
    tip: (d) => `${d.label}<br>女 ${d.female}分 − 男 ${d.male}分 = ${d.value}分`
  })
);

const points = data.rows.map((d) => ({
  x: d.male.housework,
  y: d.female.housework,
  label: d.pref
}));

observe(scatterEl, (dims) =>
  renderScatter(scatterEl, points, dims, {
    xLabel: data.columns.housework.label + " (M)",
    yLabel: data.columns.housework.label + " (F)",
    tip: (d) => `${d.label}<br>男 ${d.x}分 / 女 ${d.y}分`
  })
);
