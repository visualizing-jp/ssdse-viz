import { observe, rootPrefix } from "../theme.js";
import { renderSlope } from "../charts/slope.js";

const root = rootPrefix();
const data = await (await fetch(`${root}/data/processed/exhibit-b.json`)).json();
const el = document.querySelector("[data-slope]");

function ranks(year) {
  return data.rows
    .filter((d) => d.year === year)
    .sort((a, b) => b.tfr - a.tfr)
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

const y0 = new Map(ranks(2012).map((d) => [d.pref, d]));
const y1 = new Map(ranks(2023).map((d) => [d.pref, d]));
const items = [...y0.keys()].map((pref) => ({
  label: pref,
  rank0: y0.get(pref).rank,
  rank1: y1.get(pref).rank,
  v0: y0.get(pref).tfr.toFixed(2),
  v1: y1.get(pref).tfr.toFixed(2)
}));

observe(el, (dims) => renderSlope(el, items, dims));
