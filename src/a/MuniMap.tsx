/**
 * 市区町村の Canvas 地図。1741の多角形を SVG で持つと重いので Canvas に描く。
 * どの市区町村にふれたかは、市区町村ごとに別の色で塗った見えない Canvas の画素で判定する。
 */

import type { Feature, FeatureCollection, Geometry } from "geojson";
import { geoMercator, geoPath } from "d3-geo";
import { useEffect, useMemo, useRef, type MouseEvent } from "react";
import type { ColorScale } from "../shared/scales.ts";
import { useWidth } from "../shared/useWidth.ts";
import type { MuniProps } from "./data.ts";

type F = Feature<Geometry, MuniProps>;

export function MuniMap({
  geo,
  value,
  scale,
  pref,
  focus,
  onHover,
  onPin,
}: {
  geo: FeatureCollection<Geometry, MuniProps>;
  value: (code: string) => number | null;
  scale: ColorScale;
  /** 絞り込む都道府県（2桁）。空なら全国。 */
  pref: string;
  focus: string | null;
  onHover: (code: string | null) => void;
  onPin: (code: string) => void;
}) {
  const [wrap, width] = useWidth<HTMLDivElement>();
  const base = useRef<HTMLCanvasElement>(null);
  const over = useRef<HTMLCanvasElement>(null);
  const hit = useRef<HTMLCanvasElement | null>(null);
  const height = Math.max(420, Math.min(640, width * 0.85));
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  const scope = useMemo(
    () => (pref === "" ? geo.features : geo.features.filter((f) => f.properties.prefecture_code === pref)),
    [geo, pref],
  );
  const path = useMemo(() => {
    const projection = geoMercator().fitExtent(
      [
        [12, 12],
        [Math.max(width, 100) - 12, height - 12],
      ],
      { type: "FeatureCollection", features: scope },
    );
    return geoPath(projection);
  }, [scope, width, height]);
  const byPick = useRef(new Map<number, F>());

  useEffect(() => {
    const canvas = base.current;
    if (canvas === null || width === 0) return;
    hit.current ??= document.createElement("canvas");
    const h = hit.current;
    for (const c of [canvas, h]) {
      c.width = Math.floor(width * dpr);
      c.height = Math.floor(height * dpr);
    }
    const ctx = canvas.getContext("2d")!;
    const hctx = h.getContext("2d", { willReadFrequently: true })!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    hctx.clearRect(0, 0, width, height);
    ctx.lineJoin = "round";
    byPick.current.clear();
    const inScope = new Set(scope.map((f) => f.properties.lg_code_5));
    geo.features.forEach((f, i) => {
      const code = f.properties.lg_code_5;
      const inside = inScope.has(code);
      ctx.beginPath();
      path.context(ctx)(f);
      ctx.fillStyle = inside ? scale.fill(value(code)) : "rgba(26,44,52,0.06)";
      ctx.fill();
      if (inside) {
        ctx.strokeStyle = "rgba(238,243,240,0.55)";
        ctx.lineWidth = pref === "" ? 0.25 : 0.6;
        ctx.stroke();
        const n = i + 1;
        byPick.current.set(n, f);
        hctx.beginPath();
        path.context(hctx)(f);
        hctx.fillStyle = `rgb(${n & 255},${(n >> 8) & 255},${(n >> 16) & 255})`;
        hctx.fill();
      }
    });
  }, [geo, scope, path, scale, value, width, height, dpr, pref]);

  useEffect(() => {
    const canvas = over.current;
    if (canvas === null || width === 0) return;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const f = focus ? geo.features.find((x) => x.properties.lg_code_5 === focus) : undefined;
    if (!f) return;
    ctx.beginPath();
    path.context(ctx)(f);
    ctx.strokeStyle = "#c4472a";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [focus, geo, path, width, height, dpr]);

  const pick = (e: MouseEvent<HTMLCanvasElement>): string | null => {
    const h = hit.current;
    if (!h) return null;
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - box.left) * dpr);
    const y = Math.floor((e.clientY - box.top) * dpr);
    const [r, g, b, a] = h.getContext("2d")!.getImageData(x, y, 1, 1).data;
    if (!a) return null;
    return byPick.current.get(r! + (g! << 8) + (b! << 16))?.properties.lg_code_5 ?? null;
  };

  return (
    <div ref={wrap} className="relative rounded-md bg-ink/[0.03]" style={{ height }}>
      {width > 0 && (
        <>
          <canvas ref={base} style={{ width, height }} className="absolute inset-0" />
          <canvas
            ref={over}
            style={{ width, height }}
            className="absolute inset-0 cursor-pointer"
            onMouseMove={(e) => onHover(pick(e))}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
              const c = pick(e);
              if (c) onPin(c);
            }}
          />
        </>
      )}
    </div>
  );
}
