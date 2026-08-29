import { d3, observe, rootPrefix } from "../theme.js";
import { renderBars } from "../charts/bar.js";

const root = rootPrefix();
const data = await (await fetch(`${root}/data/processed/exhibit-e.json`)).json();
const el = document.querySelector("[data-rank]");
let mode = "rate";

function items() {
  const rows = data.rows.map((d) => ({
    label: d.pref,
    value: mode === "rate" ? d.doctorsPer100k : d.doctors,
    doctors: d.doctors,
    pop: d.pop,
    rate: d.doctorsPer100k
  }));
  return rows.sort((a, b) => b.value - a.value);
}

function draw(dims) {
  renderBars(el, items(), dims, {
    tickFormat: mode === "rate" ? (d) => d.toFixed(0) : d3.format(","),
    tip: (d) =>
      `${d.label}<br>${d.doctors.toLocaleString("ja-JP")}人 / 人口10万あたり ${d.rate.toFixed(1)}`
  });
}

observe(el, draw);

document.querySelectorAll("[data-rank-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.rankMode;
    document.querySelectorAll("[data-rank-mode]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    draw({ width: el.clientWidth, height: el.clientHeight });
  });
});
