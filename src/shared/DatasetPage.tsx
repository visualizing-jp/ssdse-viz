/**
 * データセットページの外枠。問いの見出し、切り口タブ（?view=）、出典までを受け持つ。
 * 中身のビューはそれぞれのセットが渡す。
 */

import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "./SiteFooter.tsx";
import { SiteNav } from "./SiteNav.tsx";
import { csvUrl, pdfUrl, setInfo, type SetId } from "./site.ts";
import { useUrlState } from "./useUrlState.ts";

export interface View<V extends string> {
  id: V;
  label: string;
  hint: string;
}

export function DatasetPage<V extends string>({
  id,
  views,
  render,
  footnote,
}: {
  id: SetId;
  views: readonly View<V>[];
  render: (view: V, go: (view: V) => void) => ReactNode;
  footnote: ReactNode;
}) {
  const set = setInfo(id);
  const [view, setView] = useUrlState<V>("view", views[0]!.id, (v) => views.some((x) => x.id === v));

  return (
    <div className="min-h-dvh">
      <SiteNav here={id} />
      <header className="border-b border-ink/10">
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-x-6 gap-y-3 px-6 pt-6">
          <div className="pb-3">
            <p className="font-display text-[11px] tracking-[0.14em] text-muted">
              {set.dataset} · {set.grain} · {set.items}
            </p>
            <h1 className="pt-1 text-[22px] leading-snug font-semibold tracking-[0.02em] md:text-[26px]">
              <span className="mr-2 text-accent">{set.letter}</span>
              {set.question}
            </h1>
          </div>
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="切り口">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-current={view === v.id ? "page" : undefined}
                className={`shrink-0 cursor-pointer border-b-2 px-3 pt-1 pb-2.5 font-display text-[13px] transition-colors duration-150 ${
                  view === v.id ? "border-accent font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {v.label}
                <span className="ml-1.5 text-[10px] font-normal text-faint">{v.hint}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <Suspense key={view} fallback={<Loading />}>
        {render(view, setView)}
      </Suspense>

      <SiteFooter>
        <p>
          このページの出典：独立行政法人 統計センター {set.dataset}（原典：{set.original}）を加工して作成。{" "}
          <a className="text-male underline hover:text-accent" href={csvUrl(set)}>
            公式CSV
          </a>{" "}
          ·{" "}
          <a className="text-male underline hover:text-accent" href={pdfUrl(set)}>
            解説PDF
          </a>
        </p>
        <div className="text-muted">{footnote}</div>
      </SiteFooter>
    </div>
  );
}

function Loading() {
  return <div className="mx-auto w-full max-w-[1240px] px-6 py-16 text-[12px] text-faint">読み込み中</div>;
}

/** 左に項目リスト、右に図。狭い画面では図を上にする。 */
export function ViewLayout({ aside, children }: { aside?: ReactNode; children: ReactNode }) {
  if (aside === undefined) {
    return <div className="mx-auto w-full max-w-[1240px] px-6 py-6">{children}</div>;
  }
  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-6 py-6 max-lg:flex-col-reverse">
      <aside className="w-[300px] shrink-0 overflow-y-auto max-lg:max-h-[60vh] max-lg:w-full lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)]">
        {aside}
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

/** 見出し行。左に項目名と全国値など、右に切替。 */
export function ViewHeader({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 pb-4">
      <div className="min-w-0">
        <h2 className="text-[19px] leading-snug font-semibold tracking-tight">{title}</h2>
        {meta && <div className="tnum pt-1 text-[12px] text-muted">{meta}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** 図の下に置く「読み方」「注意」。 */
export function Notes({ read, caution }: { read: ReactNode[]; caution: ReactNode[] }) {
  return (
    <section className="mt-8 grid gap-6 border-t border-ink/10 pt-5 text-[13px] leading-relaxed md:grid-cols-2">
      <div>
        <h3 className="pb-1.5 text-[11px] font-medium tracking-[0.16em] text-muted">読み方</h3>
        <ul className="list-disc space-y-1 pl-4 text-ink/90">
          {read.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="pb-1.5 text-[11px] font-medium tracking-[0.16em] text-muted">注意</h3>
        <ul className="list-disc space-y-1 pl-4 text-ink/90">
          {caution.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
