/**
 * 公式 SSDSE CSV（Shift-JIS）を読む。
 *
 * どのセットも 1 行目が項目コード、そのあとに年度行や項目名行が続き、データ行になる。
 * 何行目が何かはセットごとに違うので、呼び出し側が `headerRows` で渡す。
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export const ROOT = join(import.meta.dirname, "..", "..");
export const RAW = join(ROOT, "data", "raw");

function parse(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

export interface Sheet {
  codes: string[];
  /** 年度行があるセットだけ。列ごとの年次。 */
  years: string[] | null;
  labels: string[];
  data: string[][];
  col: (code: string) => number;
}

export function readSheet(file: string, layout: { years: number | null; labels: number; data: number }): Sheet {
  const rows = parse(new TextDecoder("shift_jis").decode(readFileSync(join(RAW, file))));
  const codes = rows[0]!;
  const index = new Map(codes.map((c, i) => [c, i]));
  return {
    codes,
    years: layout.years === null ? null : rows[layout.years]!,
    labels: rows[layout.labels]!,
    data: rows.slice(layout.data).filter((r) => r.some((c) => c !== "")),
    col(code) {
      const i = index.get(code);
      if (i === undefined) throw new Error(`${file}: 項目コード ${code} がない`);
      return i;
    },
  };
}

export function num(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** 地域コード R01000 → 都道府県コード "01"、R01100 → 市区町村コード "01100"。 */
export function prefOf(region: string): string {
  return region.replace(/^R/, "").slice(0, 2);
}

export function muniOf(region: string): string {
  return region.replace(/^R/, "");
}

/** 項目コードの列（地域情報などの識別列を除く）。 */
export function valueCodes(sheet: Sheet, skip: number): string[] {
  return sheet.codes.slice(skip).filter((c) => c !== "");
}
