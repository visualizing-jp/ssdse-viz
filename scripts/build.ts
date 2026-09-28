/**
 * data/raw の公式 CSV → public/data の配信 JSON。
 *
 *   node scripts/build.ts          全セット
 *   node scripts/build.ts --set=e  E だけ
 */

import { buildA } from "./sets/a.ts";
import { buildB } from "./sets/b.ts";
import { buildC } from "./sets/c.ts";
import { buildD } from "./sets/d.ts";
import { buildE } from "./sets/e.ts";
import { buildF } from "./sets/f.ts";

const BUILDERS = { a: buildA, b: buildB, c: buildC, d: buildD, e: buildE, f: buildF };

const only = process.argv.find((a) => a.startsWith("--set="))?.slice(6);
if (only !== undefined && !(only in BUILDERS)) throw new Error(`--set は a〜f: ${only}`);

for (const [id, build] of Object.entries(BUILDERS)) {
  if (only === undefined || only === id) build();
}
