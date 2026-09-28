import { VISUALIZING_URL, VisualizingMark } from "./Brand.tsx";
import { SETS, url, type SetId } from "./site.ts";

export type Here = SetId | "hub" | "about";

export function SiteNav({ here }: { here: Here }) {
  const link = (active: boolean) =>
    `shrink-0 rounded-md px-2 py-1 text-[13px] tracking-[0.04em] no-underline transition-colors duration-150 ${
      active ? "bg-ink/[0.07] font-semibold text-ink" : "text-muted hover:text-ink"
    }`;
  return (
    <nav
      aria-label="サイト"
      className="border-b border-ink/10 bg-[color-mix(in_oklab,var(--color-paper)_88%,white)] font-display"
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-x-1 gap-y-1 overflow-x-auto px-6 py-2.5">
        <a
          href={url("index.html")}
          aria-current={here === "hub" ? "page" : undefined}
          className="mr-auto shrink-0 pr-4 text-[14px] font-semibold tracking-[0.08em] text-ink no-underline"
        >
          SSDSE 図版
        </a>
        {SETS.map((s) => (
          <a
            key={s.id}
            href={url(`${s.id}/`)}
            aria-current={here === s.id ? "page" : undefined}
            className={link(here === s.id)}
          >
            <span className="tnum mr-1 font-semibold">{s.letter}</span>
            {s.name}
          </a>
        ))}
        <a href={url("about.html")} aria-current={here === "about" ? "page" : undefined} className={link(here === "about")}>
          このサイトについて
        </a>
        <a
          href={VISUALIZING_URL}
          aria-label="visualizing.jp"
          className="ml-2 inline-flex shrink-0 items-center gap-1.5 border-l border-ink/10 pl-3 text-[11px] tracking-[0.08em] text-muted no-underline transition-colors duration-150 hover:text-ink"
        >
          <VisualizingMark className="h-[18px] w-auto" />
          <span className="hidden sm:inline">visualizing.jp</span>
        </a>
      </div>
    </nav>
  );
}
