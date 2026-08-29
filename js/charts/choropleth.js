import { d3, topojson, SEQ, NODATA, reducedMotion } from "../theme.js";
import { showTip, moveTip, hideTip } from "../tooltip.js";

export function colorScale(values, mode) {
  const v = values.filter((d) => d != null);
  if (mode === "quantile") {
    return d3.scaleQuantile().domain(v).range(SEQ);
  }
  const [lo, hi] = d3.extent(v);
  return d3.scaleQuantize().domain([lo, hi]).range(SEQ);
}

export function renderLegend(el, scale) {
  el.innerHTML = "";
  el.className = "legend";
  const lo = document.createElement("span");
  lo.textContent = "\u4f4e";
  el.appendChild(lo);
  SEQ.forEach((c) => {
    const s = document.createElement("span");
    s.className = "swatch";
    s.style.background = c;
    el.appendChild(s);
  });
  const hi = document.createElement("span");
  hi.textContent = "\u9ad8";
  el.appendChild(hi);
}

export function japanFit(features, width, height) {
  const projection = d3.geoMercator();
  const path = d3.geoPath(projection);
  projection.fitExtent(
    [
      [12, 8],
      [width - 12, height - 8]
    ],
    { type: "FeatureCollection", features }
  );
  return { projection, path };
}

export function renderPrefMap(el, topo, values, dims, opts = {}) {
  const width = dims.width;
  const height = Math.max(260, dims.height || 320);
  el.innerHTML = "";
  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .style("width", "100%")
    .style("height", "100%");
  const objectName = Object.keys(topo.objects)[0];
  const fc = topojson.feature(topo, topo.objects[objectName]);
  const { path } = japanFit(fc.features, width, height);
  const scale = colorScale([...values.values()], opts.mode || "quantile");
  const g = svg.append("g");
  const animate = opts.animate && !reducedMotion();

  g.selectAll("path")
    .data(fc.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const id = d.id || d.properties.prefecture_code;
      const v = values.get(id);
      return v == null ? NODATA : scale(v);
    })
    .attr("stroke", "#dce4df")
    .attr("stroke-width", 0.6)
    .attr("fill-opacity", animate ? 0 : 1)
    .on("pointerenter", (event, d) => {
      const id = d.id || d.properties.prefecture_code;
      const v = values.get(id);
      showTip(opts.tip ? opts.tip(d, v) : id, event);
    })
    .on("pointermove", moveTip)
    .on("pointerleave", hideTip);

  if (animate) {
    g.selectAll("path")
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("fill-opacity", 1);
  }

  el.appendChild(svg.node());
  if (opts.legendEl) renderLegend(opts.legendEl, scale);
  return { scale };
}
