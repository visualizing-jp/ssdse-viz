import { DatasetPage, type View } from "../shared/DatasetPage.tsx";
import { mount } from "../shared/mount.tsx";
import { ChangeView } from "./views/ChangeView.tsx";
import { GeoView } from "./views/GeoView.tsx";
import { TrendView } from "./views/TrendView.tsx";

type V = "trend" | "geo" | "change";

const VIEWS: View<V>[] = [
  { id: "trend", label: "推移", hint: "2012–2023年度" },
  { id: "geo", label: "地域", hint: "年度を選んで" },
  { id: "change", label: "変化", hint: "2年度の比較" },
];

mount(
  <DatasetPage
    id="b"
    views={VIEWS}
    render={(view) => (
      <>
        {view === "trend" && <TrendView />}
        {view === "geo" && <GeoView />}
        {view === "change" && <ChangeView />}
      </>
    )}
    footnote={
      <p>
        47都道府県 × 12年度（2012〜2023年度）× 109項目。社会・人口統計体系の年度表記に合わせています。気象と家計の項目は県庁所在市の値。
      </p>
    }
  />,
);
