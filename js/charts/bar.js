import { d3, svgCanvas, SEQ } from "../theme.js";
import { showTip, moveTip, hideTip } from "../tooltip.js";

const ROW = 30;
const LABEL_SIZE = 16;

export function renderBars(el, items, dims, opts = {}) {
  const margin = { top: 10, right: 40, bottom: 32, left: 96 };
  const height = items.length * ROW + margin.top + margin.bottom;
  const { g, innerWidth, innerHeight } = svgCanvas(el, dims.width, height, margin, {
    intrinsic: true
  });
  const color = d3
    .scaleQuantile()
    .domain(items.map((d) => d.value))
    .range(SEQ);
  const max = d3.max(items, (d) => d.value) || 1;
  const x = d3.scaleLinear().domain([0, max]).nice().range([0, innerWidth]);
  const y = d3
    .scaleBand()
    .domain(items.map((d) => d.label))
    .range([0, innerHeight])
    .padding(0.32);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickSize(-innerHeight)
        .tickSizeOuter(0)
        .tickFormat(opts.tickFormat || d3.format(","))
    );

  g.selectAll("rect")
    .data(items)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d) => y(d.label))
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d.value))
    .attr("fill", (d) => d.color || color(d.value))
    .on("pointerenter", (event, d) => showTip(opts.tip ? opts.tip(d) : d.label, event))
    .on("pointermove", moveTip)
    .on("pointerleave", hideTip);

  g.selectAll("text.name")
    .data(items)
    .join("text")
    .attr("class", "name")
    .attr("x", -8)
    .attr("y", (d) => y(d.label) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .attr("fill", "#1a2c34")
    .attr("font-family", "IBM Plex Sans JP")
    .attr("font-size", LABEL_SIZE)
    .text((d) => d.label);
}
