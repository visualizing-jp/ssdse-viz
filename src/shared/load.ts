import { url } from "./site.ts";

const cache = new Map<string, Promise<unknown>>();

/**
 * 配信 JSON を読む。同じパスは同じ Promise を返すので、React の `use()` にそのまま渡せる。
 */
export function loadJson<T>(path: string): Promise<T> {
  let p = cache.get(path);
  if (p === undefined) {
    p = fetch(url(path)).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    });
    cache.set(path, p);
  }
  return p as Promise<T>;
}
