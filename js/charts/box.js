import { d3, svgCanvas, INK, VERMILION } from "../theme.js";
import { showTip, moveTip, hideTip } from "../tooltip.js";

function quartiles(values) {
  const v = values.filter((d) => d != null).sort(d3.ascending);
  return {
    min: v[0],
    q1: d3.quantile(v, 0.25),
    med: d3.quantile(v, 0.5),
    q3: d3.quantile(v, 0.75),
    max: v[v.length - 1],
    values: v
  };
}

export function renderBox(el, series, dims) {
  const margin = { top: 16, right: 16, bottom: 36, left: 64 };
  const height = Math.max(280, dims.height || 320);
  const width = dims.width;
  const { g, innerWidth, innerHeight } = svgCanvas(el, width, height, margin);

  const stats = series.map((s) => ({ ...s, ...quartiles(s.values) }));
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(stats, (d) => d.max) * 1.05])
    .nice()
    .range([innerHeight, 0]);
  const x = d3
    .scaleBand()
    .domain(stats.map((d) => d.label))
    .range([0, innerWidth])
    .padding(0.45);

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(6).tickSizeOuter(0).tickFormat((d) => d3.format(",")(d)));
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  const boxW = Math.min(54, x.bandwidth());
  stats.forEach((s) => {
    const cx = x(s.label) + x.bandwidth() / 2;
    const iqr = s.q3 - s.q1;
    const lo = Math.max(s.min, s.q1 - 1.5 * iqr);
    const hi = Math.min(s.max, s.q3 + 1.5 * iqr);
    const outliers = s.values.filter((v) => v < lo || v > hi);

    g.append("line")
      .attr("x1", cx)
      .attr("x2", cx)
      .attr("y1", y(lo))
      .attr("y2", y(hi))
      .attr("stroke", INK)
      .attr("stroke-width", 1.2);
    g.append("rect")
      .attr("x", cx - boxW / 2)
      .attr("width", boxW)
      .attr("y", y(s.q3))
      .attr("height", Math.max(1, y(s.q1) - y(s.q3)))
      .attr("fill", s.color || "#5a9188")
      .attr("fill-opacity", 0.85);
    g.append("line")
      .attr("x1", cx - boxW / 2)
      .attr("x2", cx + boxW / 2)
      .attr("y1", y(s.med))
      .attr("y2", y(s.med))
      .attr("stroke", "#e8f2ed")
      .attr("stroke-width", 2);

    g.selectAll(null)
      .data(outliers)
      .join("circle")
      .attr("cx", cx)
      .attr("cy", (d) => y(d))
      .attr("r", 3.2)
      .attr("fill", VERMILION)
      .attr("stroke", "#e8f2ed")
      .attr("stroke-width", 0.8)
      .on("pointerenter", (event, d) => {
        showTip(`${s.label}<br>${Math.round(d).toLocaleString("ja-JP")}`, event);
      })
      .on("pointermove", moveTip)
      .on("pointerleave", hideTip);
  });
}

export function renderHist(el, values, dims, opts = {}) {
  const margin = { top: 12, right: 12, bottom: 36, left: 48 };
  const height = Math.max(180, dims.height || 200);
  const { g, innerWidth, innerHeight } = svgCanvas(el, dims.width, height, margin);
  const v = values.filter((d) => d != null);
  const bins = d3.bin().thresholds(12)(v);
  const x = d3
    .scaleLinear()
    .domain([bins[0].x0, bins[bins.length - 1].x1])
    .range([0, innerWidth]);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(bins, (d) => d.length)])
    .nice()
    .range([innerHeight, 0]);

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickSizeOuter(0));
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0).tickFormat((d) => d3.format(",")(d)));

  g.selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", (d) => x(d.x0) + 1)
    .attr("y", (d) => y(d.length))
    .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr("height", (d) => innerHeight - y(d.length))
    .attr("fill", opts.color || "#2f6b70");
}
