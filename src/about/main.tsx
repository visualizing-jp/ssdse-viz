import { mount } from "../shared/mount.tsx";
import { SiteFooter } from "../shared/SiteFooter.tsx";
import { SiteNav } from "../shared/SiteNav.tsx";

const a = "text-male underline hover:text-accent";
const h2 = "pt-6 pb-2 text-[18px] font-semibold";

function About() {
  return (
    <div className="min-h-dvh">
      <SiteNav here="about" />
      <main className="mx-auto w-full max-w-[46rem] space-y-3 px-6 pt-10 text-[16px] leading-[1.8]">
        <p className="font-display text-[12px] font-medium tracking-[0.16em] text-muted">About</p>
        <h1 className="text-[28px] font-semibold">このサイトについて</h1>
        <p>
          独立行政法人統計センターが公開する SSDSE（教育用標準データセット）を素材にした、非公式の可視化ショーケースです。統計教育の教員、コンペを意識する高校生・大学生、可視化の学習者に向けて、問い・図・読み方・注意をセットで置いています。
        </p>
        <h2 className={h2}>データの版</h2>
        <p>公式CSVをリポジトリにスナップショットしています。ランタイムで nstac.go.jp から取得しません。</p>
        <ul className="list-disc pl-5">
          <li>SSDSE-A-2026（市区町村）</li>
          <li>SSDSE-B-2026（県別推移、2012–2023年）</li>
          <li>SSDSE-C-2026（家計消費、2023–2025年）</li>
          <li>SSDSE-D-2023（社会生活、2021年調査）</li>
          <li>SSDSE-E-2026（基本素材）</li>
          <li>SSDSE-F-2023v3（気候値、1991–2020年平年値）</li>
        </ul>
        <h2 className={h2}>出典と利用</h2>
        <p>
          独立行政法人 統計センター SSDSE（
          <a className={a} href="https://www.nstac.go.jp/use/literacy/ssdse/">
            SSDSE（教育用標準データセット）のページ
          </a>
          ）を加工して作成。
        </p>
        <p>記載は公式の例に沿っています。統計センターが作ったかのように見せることはしません。</p>
        <p>地理境界は国土交通省 国土数値情報（行政区域）を加工した TopoJSON で、SSDSE とは別ライセンスです。</p>
        <p>統計データ分析コンペティションの案内は公式サイトを見てください。</p>
      </main>
      <SiteFooter />
    </div>
  );
}

mount(<About />);
