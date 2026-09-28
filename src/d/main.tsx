import { DatasetPage, type View } from "../shared/DatasetPage.tsx";
import { mount } from "../shared/mount.tsx";
import { GeoView } from "./views/GeoView.tsx";
import { RateView } from "./views/RateView.tsx";
import { TimeView } from "./views/TimeView.tsx";

type V = "time" | "rate" | "geo";

const VIEWS: View<V>[] = [
  { id: "time", label: "生活時間", hint: "1日の20行動" },
  { id: "rate", label: "行動者率", hint: "男女の差" },
  { id: "geo", label: "地域", hint: "タイル地図・順位" },
];

mount(
  <DatasetPage
    id="d"
    views={VIEWS}
    render={(view) => (
      <>
        {view === "time" && <TimeView />}
        {view === "rate" && <RateView />}
        {view === "geo" && <GeoView />}
      </>
    )}
    footnote={
      <p>
        男女の別（総数・男・女）× 全国及び47都道府県 × 121項目。令和3年社会生活基本調査（調査票Aに基づく結果）。行動者率は10歳以上、生活時間は10歳以上の週全体の総平均（一部の追加項目を除く）、平均時刻は平日。
      </p>
    }
  />,
);
