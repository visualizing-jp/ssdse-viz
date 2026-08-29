import { d3, svgCanvas, VERMILION, MALE } from "../theme.js";
import { showTip, moveTip, hideTip } from "../tooltip.js";

export function renderScatter(el, points, dims, opts = {}) {
  const margin = { top: 20, right: 20, bottom: 44, left: 56 };
  const height = Math.max(240, dims.height || 280);
  const { g, innerWidth, innerHeight } = svgCanvas(el, dims.width, height, margin);

  const x = d3
    .scaleLinear()
    .domain([d3.min(points, (d) => d.x) * 0.92, d3.max(points, (d) => d.x) * 1.04])
    .nice()
    .range([0, innerWidth]);
  const y = d3
    .scaleLinear()
    .domain([d3.min(points, (d) => d.y) * 0.92, d3.max(points, (d) => d.y) * 1.04])
    .nice()
    .range([innerHeight, 0]);

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(6).tickSize(-innerWidth).tickSizeOuter(0).tickFormat(d3.format(",")));
  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(6).tickSizeOuter(0).tickFormat(d3.format(",")));

  g.append("text")
    .attr("x", innerWidth)
    .attr("y", innerHeight + 36)
    .attr("text-anchor", "end")
    .attr("fill", MUTED_SAFE())
    .attr("font-family", "IBM Plex Sans JP")
    .attr("font-size", 14)
    .text(opts.xLabel || "");
  g.append("text")
    .attr("x", 0)
    .attr("y", -8)
    .attr("fill", MUTED_SAFE())
    .attr("font-family", "IBM Plex Sans JP")
    .attr("font-size", 14)
    .text(opts.yLabel || "");

  g.selectAll("circle")
    .data(points)
    .join("circle")
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .attr("r", 5)
    .attr("fill", (d) => d.color || MALE)
    .attr("fill-opacity", 0.82)
    .attr("stroke", "#e8f2ed")
    .attr("stroke-width", 1)
    .on("pointerenter", (event, d) => {
      d3.select(event.currentTarget).attr("fill", VERMILION).attr("r", 7);
      showTip(opts.tip ? opts.tip(d) : d.label, event);
    })
    .on("pointermove", moveTip)
    .on("pointerleave", (event) => {
      d3.select(event.currentTarget).attr("fill", event.currentTarget.__color || MALE).attr("r", 5);
      hideTip();
    });
}

function MUTED_SAFE() {
  return "#4a5d56";
}
