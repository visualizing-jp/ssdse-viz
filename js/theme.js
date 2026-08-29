export const d3 = globalThis.d3;
export const topojson = globalThis.topojson;

export const SEQ = [
  "#e8f2ed",
  "#c5ddd4",
  "#8fb9ae",
  "#5a9188",
  "#2f6b70",
  "#1a4a52",
  "#122f38"
];

export const INK = "#1a2c34";
export const MUTED = "#4a5d56";
export const VERMILION = "#c4472a";
export const MALE = "#2a5f8a";
export const PAPER = "#dce4df";
export const NODATA = "#c5cdc8";

export function yen(v) {
  return `${Math.round(v).toLocaleString("ja-JP")}円`;
}

export function pct(v, digits = 1) {
  return `${v.toFixed(digits)}%`;
}

export function per100k(v) {
  return `${v.toFixed(1)}人`;
}

export function rootPrefix() {
  return document.documentElement.dataset.root || ".";
}

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function observe(el, draw) {
  let last = 0;
  const run = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w < 16) return;
    if (Math.abs(w - last) < 1 && last !== 0) return;
    last = w;
    draw({ width: w, height: Math.max(h, 160) });
  };
  const ro = new ResizeObserver(run);
  ro.observe(el);
  run();
  return ro;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function svgCanvas(el, width, height, margin, opts = {}) {
  clear(el);
  const intrinsic = opts.intrinsic === true;
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("preserveAspectRatio", intrinsic ? "xMinYMin meet" : "xMidYMid meet")
    .style("width", "100%")
    .style("height", intrinsic ? `${height}px` : "100%")
    .style("display", "block");
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  el.appendChild(svg.node());
  return {
    svg,
    g,
    innerWidth: width - margin.left - margin.right,
    innerHeight: height - margin.top - margin.bottom
  };
}
