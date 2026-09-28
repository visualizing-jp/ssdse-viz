import type { ReactNode } from "react";
import { VisualizedBy } from "./Brand.tsx";

const a = "text-male underline hover:text-accent";

export function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="mt-12 border-t border-ink/10">
      <div className="mx-auto w-full max-w-[1240px] space-y-2 px-6 pt-5 pb-10 text-[12px] leading-relaxed text-muted">
        {children}
        <p>
          出典：独立行政法人 統計センター SSDSE（
          <a className={a} href="https://www.nstac.go.jp/use/literacy/ssdse/">
            SSDSE（教育用標準データセット）のページ
          </a>
          ）を加工して作成。版：SSDSE-A-2026、SSDSE-B-2026、SSDSE-C-2026、SSDSE-D-2023、SSDSE-E-2026、SSDSE-F-2023v3。
        </p>
        <p>
          地理データは国土交通省{" "}
          <a className={a} href="https://nlftp.mlit.go.jp/ksj/">
            国土数値情報（行政区域データ）
          </a>
          を{" "}
          <a className={a} href="https://github.com/K-Oxon/Japan-map-for-BI">
            K-Oxon/Japan-map-for-BI
          </a>{" "}
          が簡素化したもの（CC BY 4.0）。SSDSE本体とは別出典です。
        </p>
        <p>
          本サイトは独立行政法人統計センターの公式サイトではありません。ロゴは使用していません。利用は
          <a className={a} href="https://www.nstac.go.jp/info/site-policy/">
            統計センターのサイトポリシー
          </a>
          （政府標準利用規約 2.0 / CC BY 互換）に従います。
        </p>
        <div className="mt-6 border-t border-ink/10 pt-5">
          <VisualizedBy />
        </div>
      </div>
    </footer>
  );
}
