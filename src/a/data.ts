import type { FeatureCollection, Geometry } from "geojson";
import { use, useMemo } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { loadJson } from "../shared/load.ts";
import { applyMode, effectiveMode, type Mode } from "../shared/metric.ts";
import type { Indicator, MuniMeta } from "../shared/types.ts";

export const loadMeta = () => loadJson<MuniMeta>("data/a/meta.json");
export const loadValues = (code: string) => loadJson<(number | null)[]>(`data/a/values/${code}.json`);

export const DEFAULT_IND = "A1303";

export interface MuniProps {
  lg_code_5: string;
  city_name: string;
  prefecture_code: string;
  prefecture_name: string;
  is_hoppo_city: boolean;
}

let geo: Promise<FeatureCollection<Geometry, MuniProps>> | null = null;

/** 市区町村境界。北方領土の6村は SSDSE-A にないので落とす。 */
export function loadGeo() {
  geo ??= loadJson<Topology>("geo/ja_municipality_area_5.topojson").then((topo) => {
    const key = Object.keys(topo.objects)[0]!;
    const fc = feature(topo, topo.objects[key] as GeometryCollection<MuniProps>) as FeatureCollection<Geometry, MuniProps>;
    return { ...fc, features: fc.features.filter((f) => !f.properties.is_hoppo_city) };
  });
  return geo;
}

/** 実数か人口あたりの値（市区町村の並び）。分母のファイルも一緒に読む。 */
export function useMuniValues(ind: Indicator, mode: Mode): (number | null)[] {
  const values = use(loadValues(ind.code));
  const den = use(loadValues(effectiveMode(ind, mode) === "rate" ? ind.rate!.den : ind.code));
  return useMemo(() => applyMode(ind, mode, values, den), [ind, mode, values, den]);
}
