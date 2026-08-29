import { d3, svgCanvas, VERMILION } from "../theme.js";
import { showTip, moveTip, hideTip } from "../tooltip.js";

const ROW = 28;
const LABEL_SIZE = 16;

export function renderSlope(el, items, dims) {
  const margin = { top: 20, right: 108, bottom: 20, left: 108 };
  const height = items.length * ROW + margin.top + margin.bottom;
  const { g, innerWidth, innerHeight } = svgCanvas(el, dims.width, height, margin, {
    intrinsic: true
  });
  const y = d3.scalePoint().domain(d3.range(1, items.length + 1)).range([0, innerHeight]);

  g.append("line").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", innerHeight).attr("stroke", "#7d8f88");
  g.append("line")
    .attr("x1", innerWidth)
    .attr("x2", innerWidth)
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", "#7d8f88");

  g.selectAll("line.slope")
    .data(items)
    .join("line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", (d) => y(d.rank0))
    .attr("y2", (d) => y(d.rank1))
    .attr("stroke", (d) => (Math.abs(d.rank1 - d.rank0) >= 8 ? VERMILION : "#7d8f88"))
    .attr("stroke-opacity", (d) => (Math.abs(d.rank1 - d.rank0) >= 8 ? 0.95 : 0.28))
    .attr("stroke-width", (d) => (Math.abs(d.rank1 - d.rank0) >= 8 ? 1.8 : 1));

  const label = (side) =>
    g
      .selectAll(`text.${side}`)
      .data(items)
      .join("text")
      .attr("class", side)
      .attr("x", side === "left" ? -10 : innerWidth + 10)
      .attr("y", (d) => y(side === "left" ? d.rank0 : d.rank1))
      .attr("dy", "0.35em")
      .attr("text-anchor", side === "left" ? "end" : "start")
      .attr("fill", (d) => (Math.abs(d.rank1 - d.rank0) >= 8 ? VERMILION : "#1a2c34"))
      .attr("font-family", "IBM Plex Sans JP")
      .attr("font-size", LABEL_SIZE)
      .text((d) => d.label)
      .on("pointerenter", (event, d) => {
        showTip(
          `${d.label}<br>2012: ${d.rank0}位 ${d.v0}<br>2023: ${d.rank1}位 ${d.v1}`,
          event
        );
      })
      .on("pointermove", moveTip)
      .on("pointerleave", hideTip);

  label("left");
  label("right");
}

export function renderHeatmap(el, rows, dims, opts = {}) {
  const margin = { top: 32, right: 12, bottom: 24, left: 92 };
  const rowH = 22;
  const labelSize = 14;
  const height = rows.length * rowH + margin.top + margin.bottom;
  const { g, innerWidth, innerHeight } = svgCanvas(el, dims.width, height, margin, {
    intrinsic: true
  });
  const months = d3.range(1, 13);
  const x = d3.scaleBand().domain(months).range([0, innerWidth]).padding(0.08);
  const y = d3.scaleBand().domain(rows.map((d) => d.label)).range([0, innerHeight]).padding(0.2);
  const vals = rows.flatMap((r) => r.values).filter((v) => v != null && Number.isFinite(v));
  const color =
    opts.color ||
    d3.scaleSequential(d3.interpolateYlGnBu).domain(d3.extent(vals));

  g.selectAll("g.row")
    .data(rows)
    .join("g")
    .attr("transform", (d) => `translate(0,${y(d.label)})`)
    .each(function (row) {
      d3.select(this)
        .selectAll("rect")
        .data(row.values.map((v, i) => ({ v, m: i + 1, label: row.label })))
        .join("rect")
        .attr("x", (d) => x(d.m))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", (d) => (d.v == null ? "#c5cdc8" : color(d.v)))
        .attr("stroke", "rgba(26,44,52,0.06)")
        .attr("stroke-width", 0.5)
        .on("pointerenter", (event, d) => {
          showTip(`${d.label} ${d.m}月<br>${opts.format ? opts.format(d.v) : d.v}`, event);
        })
        .on("pointermove", moveTip)
        .on("pointerleave", hideTip);
    });

  g.selectAll("text.row")
    .data(rows)
    .join("text")
    .attr("x", -8)
    .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .attr("fill", "#1a2c34")
    .attr("font-family", "IBM Plex Sans JP")
    .attr("font-size", labelSize)
    .text((d) => d.label);

  g.selectAll("text.col")
    .data(months)
    .join("text")
    .attr("x", (d) => x(d) + x.bandwidth() / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("fill", "#4a5d56")
    .attr("font-family", "IBM Plex Sans JP")
    .attr("font-size", 12)
    .text((d) => `${d}`);
}
