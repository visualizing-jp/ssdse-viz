/**
 * トップの地図。県庁所在市の牛肉支出（SSDSE-C-2026）の都道府県コロプレス。
 */

import type { Feature, FeatureCollection, Geometry, MultiPolygon, Position } from "geojson";
import { geoBounds, geoMercator, geoPath, type GeoProjection } from "d3-geo";
import { use, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { withUnit } from "../shared/format.ts";
import { Legend } from "../shared/Legend.tsx";
import { loadJson } from "../shared/load.ts";
import { quantileScale } from "../shared/scales.ts";
import type { SnapshotData } from "../shared/types.ts";
import { useWidth } from "../shared/useWidth.ts";

interface PrefProps {
  prefecture_code: string;
  prefecture_name: string;
}

const load = () =>
  Promise.all([loadJson<SnapshotData>("data/c.json"), loadJson<Topology>("geo/ja_prefecture_area.topojson")]);
let pending: ReturnType<typeof load> | null = null;

const INSET_PAD = 6;

type Pref = Feature<Geometry, PrefProps>;
interface Piece {
  code: string;
  place: "main" | "southwest" | "ogasawara";
  feature: Feature<MultiPolygon>;
}

/** 多角形ごとの行き先。沖縄県と奄美群島（北緯29度未満の鹿児島県）は南西へ、北緯30度未満の東京都（小笠原・硫黄島）は小笠原へ。 */
function placeOf(code: string, polygon: Position[][]): Piece["place"] {
  const north = geoBounds({ type: "Polygon", coordinates: polygon })[1][1];
  if (code === "47" || (code === "46" && north < 29)) return "southwest";
  if (code === "13" && north < 30) return "ogasawara";
  return "main";
}

function splitRemote(f: Pref): Piece[] {
  const g = f.geometry;
  const polygons = g.type === "MultiPolygon" ? g.coordinates : g.type === "Polygon" ? [g.coordinates] : [];
  const code = f.properties.prefecture_code;
  const by = new Map<Piece["place"], Position[][][]>();
  for (const p of polygons) {
    const place = placeOf(code, p);
    by.set(place, [...(by.get(place) ?? []), p]);
  }
  return [...by].map(([place, coordinates]) => ({
    code,
    place,
    feature: { type: "Feature", properties: {}, geometry: { type: "MultiPolygon", coordinates } },
  }));
}

/** 本土と同じ縮尺のまま、島々を corner が返す位置（左上 x, y）へ平行移動する投影と、その枠。 */
function inset(
  main: GeoProjection,
  islands: FeatureCollection<MultiPolygon>,
  corner: (w: number, h: number) => [number, number],
) {
  const p = geoMercator().scale(main.scale()).translate(main.translate());
  const [[x0, y0], [x1, y1]] = geoPath(p).bounds(islands);
  const w = x1 - x0 + 2 * INSET_PAD;
  const h = y1 - y0 + 2 * INSET_PAD;
  const [bx, by] = corner(w, h);
  const [tx, ty] = main.translate();
  p.translate([tx + bx + INSET_PAD - x0, ty + by + INSET_PAD - y0]);
  return { path: geoPath(p), box: { x: bx, y: by, w, h } };
}

export function HeroMap() {
  pending ??= load();
  const [c, topo] = use(pending);
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hovered, setHovered] = useState<string | null>(null);
  const key = Object.keys(topo.objects)[0]!;
  const fc = feature(topo, topo.objects[key] as GeometryCollection<PrefProps>) as FeatureCollection<Geometry, PrefProps>;
  const beef = new Map(c.areas.map((a, i) => [a.code, c.values.LB031001![i]!]));
  const scale = quantileScale(
    c.areas.filter((a) => a.code !== "00").map((a) => beef.get(a.code)!),
    (v) => withUnit(v, ""),
  );
  // ファーストビューにデータセットの目次が入るよう、画面の高さの4割に抑える。
  const height = Math.round(Math.max(240, Math.min(420, window.innerHeight * 0.4, width * 0.6)));

  // 南西諸島と小笠原まで含めて枠に収めると南へ長く伸び、本土が小さくなる。
  // 本土だけで枠いっぱいに合わせ、離れた島は同じ縮尺のまま本土の外接矩形の隅（海の余白）へ平行移動する。
  const pieces = fc.features.flatMap((f) => splitRemote(f));
  const group = (p: Piece["place"]) => ({ type: "FeatureCollection" as const, features: pieces.filter((x) => x.place === p).map((x) => x.feature) });
  const main = geoMercator().fitExtent(
    [
      [12, 12],
      [Math.max(width, 100) - 12, height - 12],
    ],
    group("main"),
  );
  const [[mx0, my0], [mx1, my1]] = geoPath(main).bounds(group("main"));
  const insets = {
    main: { path: geoPath(main) },
    southwest: inset(main, group("southwest"), () => [mx0, my0]),
    ogasawara: inset(main, group("ogasawara"), (w, h) => [mx1 - w, my1 - h]),
  };
  const h = hovered ? c.areas.find((a) => a.code === hovered) : undefined;

  return (
    <div>
      <div ref={ref} className="relative bg-[color-mix(in_oklab,var(--color-fill-5)_8%,var(--color-paper))]" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label="都道府県庁所在市の牛肉支出のコロプレス" onMouseLeave={() => setHovered(null)}>
            <g className="transition-opacity duration-700 ease-out starting:opacity-0">
              {(
                [
                  [insets.southwest.box, "南西諸島"],
                  [insets.ogasawara.box, "小笠原諸島など"],
                ] as const
              ).map(([b, label]) => (
                <g key={label}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill="none" className="stroke-ink/25" />
                  <text x={b.x + 4} y={b.y + b.h - 4} className="fill-muted text-[9px]">
                    {label}
                  </text>
                </g>
              ))}
              {pieces.map((p, i) => (
                <path
                  key={i}
                  d={insets[p.place].path(p.feature) ?? ""}
                  fill={scale.fill(beef.get(p.code) ?? null)}
                  // 移した島は小さく、淡い塗りだと背景に溶けるので、濃い線で縁取る。
                  stroke={hovered === p.code ? "#1a2c34" : p.place === "main" ? "#dce4df" : "#7d8f88"}
                  strokeWidth={hovered === p.code ? 1.6 : p.place === "main" ? 0.6 : 0.8}
                  className="cursor-default"
                  onMouseEnter={() => setHovered(p.code)}
                />
              ))}
            </g>
          </svg>
        )}
        <p className="tnum absolute right-4 bottom-3 rounded-md bg-surface/85 px-2.5 py-1 text-[12px] text-ink">
          {h ? `${h.label}（${h.pref}） 牛肉 ${withUnit(beef.get(h.code)!, "円")}` : "都道府県にふれると県庁所在市の値"}
        </p>
      </div>
      <div className="mx-auto w-full max-w-[1240px] px-6">
        <Legend scale={scale} caption="牛肉 · 1世帯当たり年間支出（円） · 7分位" />
      </div>
    </div>
  );
}
