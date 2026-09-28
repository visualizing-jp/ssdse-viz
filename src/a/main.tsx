import { DatasetPage, type View } from "../shared/DatasetPage.tsx";
import { mount } from "../shared/mount.tsx";
import { MapView } from "./views/MapView.tsx";
import { SizeView } from "./views/SizeView.tsx";
import { SpreadView } from "./views/SpreadView.tsx";

type V = "map" | "spread" | "size";

const VIEWS: View<V>[] = [
  { id: "map", label: "地図", hint: "1741市区町村" },
  { id: "spread", label: "県内のばらつき", hint: "47都道府県 × 市区町村" },
  { id: "size", label: "人口規模", hint: "散布図" },
];

mount(
  <DatasetPage
    id="a"
    views={VIEWS}
    render={(view) => (
      <>
        {view === "map" && <MapView />}
        {view === "spread" && <SpreadView />}
        {view === "size" && <SizeView />}
      </>
    )}
    footnote={
      <p>
        1741市区町村 × 125項目。年次は項目ごとに社会・人口統計体系 市区町村データ（2026年6月19日公表分）の最新年次。境界は国土数値情報を簡素化したもの（北方領土の6村を除く）。
      </p>
    }
  />,
);
