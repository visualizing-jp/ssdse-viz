import { DatasetPage, type View } from "../shared/DatasetPage.tsx";
import { mount } from "../shared/mount.tsx";
import { CityView } from "./views/CityView.tsx";
import { GeoView } from "./views/GeoView.tsx";
import { SeasonView } from "./views/SeasonView.tsx";

type V = "season" | "city" | "geo";

const VIEWS: View<V>[] = [
  { id: "season", label: "季節", hint: "47地点 × 12か月" },
  { id: "city", label: "地点", hint: "雨温図" },
  { id: "geo", label: "地域", hint: "タイル地図・緯度" },
];

mount(
  <DatasetPage
    id="f"
    views={VIEWS}
    render={(view) => (
      <>
        {view === "season" && <SeasonView />}
        {view === "city" && <CityView />}
        {view === "geo" && <GeoView />}
      </>
    )}
    footnote={
      <p>
        47地点（都道府県庁所在市。埼玉県は熊谷市、滋賀県は彦根市）× 月・年 × 気象42項目（うち3項目は地点の緯度・経度・標高）。2020年平年値（1991〜2020年）第4.0.1版。
      </p>
    }
  />,
);
