import { DatasetPage, type View } from "../shared/DatasetPage.tsx";
import { mount } from "../shared/mount.tsx";
import { MapView } from "./views/MapView.tsx";
import { ProfileView } from "./views/ProfileView.tsx";
import { RelationView } from "./views/RelationView.tsx";

type V = "map" | "relation" | "profile";

const VIEWS: View<V>[] = [
  { id: "map", label: "地域", hint: "タイル地図・順位" },
  { id: "relation", label: "関係", hint: "2項目の散布図" },
  { id: "profile", label: "県プロフィール", hint: "93項目の順位" },
];

mount(
  <DatasetPage
    id="e"
    views={VIEWS}
    render={(view, go) => (
      <>
        {view === "map" && <MapView />}
        {view === "relation" && <RelationView />}
        {view === "profile" && <ProfileView openMap={() => go("map")} />}
      </>
    )}
    footnote={
      <p>
        全国及び47都道府県 × 93項目。年次は項目ごとに社会・人口統計体系の最新年次（2026年2月20日公表分）。家計の4項目は県庁所在市（東京都は区部）の値。
      </p>
    }
  />,
);
