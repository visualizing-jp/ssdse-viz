import { d3, topojson, SEQ, NODATA } from "../theme.js";
import { showTip, moveTip, hideTip } from "../tooltip.js";
import { colorScale, japanFit, renderLegend } from "./choropleth.js";

export function renderCanvasMap(el, topo, values, dims, opts = {}) {
  const width = Math.max(320, dims.width);
  const height = Math.max(260, dims.height || 320);
  el.innerHTML = "";
  el.style.position = "relative";

  const vis = document.createElement("canvas");
  const hit = document.createElement("canvas");
  vis.style.width = "100%";
  vis.style.height = "100%";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  vis.width = hit.width = Math.floor(width * dpr);
  vis.height = hit.height = Math.floor(height * dpr);
  vis.style.width = `${width}px`;
  vis.style.height = `${height}px`;
  hit.style.display = "none";
  el.appendChild(vis);
  el.appendChild(hit);

  const objectName = Object.keys(topo.objects)[0];
  const fc = topojson.feature(topo, topo.objects[objectName]);
  const { path } = japanFit(fc.features, width, height);
  const scale = colorScale([...values.values()], opts.mode || "quantile");

  const ctx = vis.getContext("2d");
  const hctx = hit.getContext("2d", { willReadFrequently: true });
  ctx.scale(dpr, dpr);
  hctx.scale(dpr, dpr);
  ctx.lineJoin = "round";

  const colorOf = new Map();
  fc.features.forEach((f, i) => {
    const id = (f.properties && (f.properties.lg_code_5 || f.properties.prefecture_code)) || f.id;
    const n = i + 1;
    const pick = `rgb(${n % 256},${Math.floor(n / 256) % 256},${Math.floor(n / 65536)})`;
    colorOf.set(pick, f);
    const v = values.get(id);
    ctx.beginPath();
    path.context(ctx)(f);
    ctx.fillStyle = v == null ? NODATA : scale(v);
    ctx.fill();
    ctx.strokeStyle = "rgba(220,228,223,0.35)";
    ctx.lineWidth = 0.3;
    ctx.stroke();
    hctx.beginPath();
    path.context(hctx)(f);
    hctx.fillStyle = pick;
    hctx.fill();
  });

  vis.addEventListener("pointermove", (event) => {
    const rect = vis.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * (vis.width / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (vis.height / rect.height));
    const px = hit.getContext("2d").getImageData(x, y, 1, 1).data;
    const pick = `rgb(${px[0]},${px[1]},${px[2]})`;
    const f = colorOf.get(pick);
    if (!f) {
      hideTip();
      return;
    }
    const id = (f.properties && (f.properties.lg_code_5 || f.properties.prefecture_code)) || f.id;
    const v = values.get(id);
    showTip(opts.tip ? opts.tip(f, v) : id, event);
  });
  vis.addEventListener("pointerleave", hideTip);
  if (opts.legendEl) renderLegend(opts.legendEl);
  return { scale };
}
