import { Suspense } from "react";
import { mount } from "../shared/mount.tsx";
import { SiteFooter } from "../shared/SiteFooter.tsx";
import { SiteNav } from "../shared/SiteNav.tsx";
import { csvUrl, pdfUrl, SETS, url } from "../shared/site.ts";
import { HeroMap } from "./HeroMap.tsx";
import { SetThumb } from "./SetThumb.tsx";

function Hub() {
  return (
    <div className="min-h-dvh">
      <SiteNav here="hub" />
      <header>
        <Suspense fallback={<div className="h-[40svh]" />}>
          <HeroMap />
        </Suspense>
        <div className="mx-auto w-full max-w-[1240px] px-6 pt-5 pb-6">
          <p className="font-display text-[12px] font-medium tracking-[0.16em] text-muted">SSDSE 可視化ショーケース · 非公式</p>
          <h1 className="pt-1 text-[clamp(1.6rem,1.1rem+2.2vw,2.6rem)] leading-tight font-bold tracking-[0.02em]">
            教育用標準データセット SSDSE を図で読む
          </h1>
          <p className="max-w-[46rem] pt-3 text-[16px] leading-relaxed text-muted">
            教育用標準データセット SSDSE の A〜F を、1セットずつ3つの切り口で見られるようにしました。項目はすべて選べます。入口の地図は、県庁所在市の牛肉支出（SSDSE-C-2026）。
          </p>
        </div>
      </header>

      <section id="sets" className="mx-auto w-full max-w-[1240px] px-6 pb-8">
        <h2 className="pb-4 font-display text-[15px] font-medium tracking-[0.18em]">データセット</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SETS.map((s) => (
            <article
              key={s.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-[color-mix(in_oklab,white_94%,var(--color-fill-0))] shadow-[0_8px_20px_rgba(26,44,52,0.10)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-fill-5/30 hover:shadow-[0_14px_28px_rgba(26,44,52,0.14)] active:translate-y-0 active:scale-[0.99]"
            >
              <SetThumb id={s.id} />
              <div className="flex flex-1 flex-col p-5">
                <p className="font-display text-[13px] tracking-[0.04em] text-muted">
                  <span className="mr-2 text-[20px] font-bold text-accent">{s.letter}</span>
                  {s.dataset} · {s.name}
                </p>
                <h3 className="pt-2 text-[19px] leading-snug font-semibold">
                  <a href={url(`${s.id}/`)} className="text-ink no-underline after:absolute after:inset-0 after:rounded-xl after:content-['']">
                    {s.question}
                  </a>
                </h3>
                <p className="tnum pt-2 text-[14px] text-muted">
                  {s.grain} · {s.items}
                </p>
                <ul className="flex flex-wrap gap-1.5 pt-3">
                  {s.views.map((v) => (
                    <li key={v} className="rounded-md bg-ink/[0.06] px-2 py-0.5 text-[12px] text-ink/80">
                      {v}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between pt-5 text-[13px]">
                  <span className="font-display font-semibold text-fill-5 transition-colors duration-150 group-hover:text-accent">
                    見る →
                  </span>
                  <span className="relative z-10 space-x-3">
                    <a className="text-male underline hover:text-accent" href={csvUrl(s)}>
                      公式CSV
                    </a>
                    <a className="text-male underline hover:text-accent" href={pdfUrl(s)}>
                      解説PDF
                    </a>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

mount(<Hub />);
