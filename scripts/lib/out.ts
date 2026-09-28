import { mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Source } from "../../src/shared/types.ts";
import { ROOT } from "./csv.ts";

export const OUT = join(ROOT, "public", "data");

export function writeJson(path: string, value: unknown): void {
  const dest = join(OUT, path);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(value));
  console.log(`${relative(ROOT, dest)}  ${(statSync(dest).size / 1024).toFixed(1)} KB`);
}

export function clean(path: string): void {
  rmSync(join(OUT, path), { recursive: true, force: true });
}

const FILES = "https://www.nstac.go.jp/files/";

export function source(dataset: string, title: string, original: string, pdf: string): Source {
  return { dataset, title, original, csv: `${FILES}${dataset}.csv`, pdf: `${FILES}${pdf}.pdf` };
}
