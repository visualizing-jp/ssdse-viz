import { DatasetPage, type View } from "../shared/DatasetPage.tsx";
import { mount } from "../shared/mount.tsx";
import { CityView } from "./views/CityView.tsx";
import { GeoView } from "./views/GeoView.tsx";
import { ItemView } from "./views/ItemView.tsx";

type V = "item" | "geo" | "city";

const VIEWS: View<V>[] = [
  { id: "item", label: "品目", hint: "226項目の分布" },
  { id: "geo", label: "地域", hint: "タイル地図・順位" },
  { id: "city", label: "都市", hint: "特化係数" },
];

mount(
  <DatasetPage
    id="c"
    views={VIEWS}
    render={(view, go) => (
      <>
        {view === "item" && <ItemView />}
        {view === "geo" && <GeoView />}
        {view === "city" && <CityView openItem={() => go("item")} />}
      </>
    )}
    footnote={
      <p>
        全国及び47都道府県庁所在市 ×
        家計消費226項目（食料の全212品目、12の中分類、食料合計、世帯人員）。二人以上の世帯の1世帯当たり年間支出金額、2023〜2025年の平均。
      </p>
    }
  />,
);
