import { observe, rootPrefix } from "../theme.js";
import { renderHeatmap } from "../charts/slope.js";
import { jmaRainScale, jmaSunScale, jmaLegendStops } from "../jma-colors.js";

const root = rootPrefix();
const data = await (await fetch(`${root}/data/processed/exhibit-f.json`)).json();
const el = document.querySelector("[data-heat]");
const legendEl = document.querySelector("[data-heat-legend]");
let metric = "rain";

function rows() {
  return data.rows.map((d) => ({
    label: d.city,
    values: Array.from({ length: 12 }, (_, i) => {
      const hit = d.months.find((x) => x.month === i + 1);
      return hit ? hit[metric] : null;
    })
  }));
}

function colorScale() {
  return metric === "rain" ? jmaRainScale() : jmaSunScale();
}

function renderLegend() {
  if (!legendEl) return;
  legendEl.replaceChildren();
  const title = document.createElement("span");
  title.className = "legend-title";
  title.textContent = metric === "rain" ? "月降水量（気象庁配色）" : "月日照時間（気象庁配色）";
  legendEl.appendChild(title);
  for (const stop of jmaLegendStops(metric)) {
    const item = document.createElement("span");
    item.className = "legend-item";
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = stop.color;
    item.append(sw, document.createTextNode(stop.label));
    legendEl.appendChild(item);
  }
}

function draw(dims) {
  renderHeatmap(el, rows(), dims, {
    color: colorScale(),
    format: (v) => (metric === "rain" ? `${v} mm` : `${v} h`)
  });
  renderLegend();
}

observe(el, draw);

document.querySelectorAll("[data-heat-metric]").forEach((btn) => {
  btn.addEventListener("click", () => {
    metric = btn.dataset.heatMetric;
    document.querySelectorAll("[data-heat-metric]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    draw({ width: el.clientWidth, height: el.clientHeight });
  });
});
