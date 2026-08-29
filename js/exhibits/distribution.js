import { observe, rootPrefix, yen } from "../theme.js";
import { renderBox, renderHist } from "../charts/box.js";

const root = rootPrefix();
const data = await (await fetch(`${root}/data/processed/exhibit-c.json`)).json();

const boxEl = document.querySelector("[data-box]");
const histEl = document.querySelector("[data-hist]");

function series() {
  return [
    { label: data.columns.beef.label, values: data.rows.map((d) => d.beef), color: "#2f6b70" },
    { label: data.columns.pork.label, values: data.rows.map((d) => d.pork), color: "#5a9188" },
    { label: data.columns.chicken.label, values: data.rows.map((d) => d.chicken), color: "#8fb9ae" }
  ];
}

observe(boxEl, (dims) => renderBox(boxEl, series(), dims));
observe(histEl, (dims) =>
  renderHist(histEl, data.rows.map((d) => d.beef), { ...dims, height: 200 }, { color: "#1a4a52" })
);
