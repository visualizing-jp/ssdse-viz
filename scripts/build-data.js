#!/usr/bin/env node
/**
 * Official SSDSE CSVs (CP932) -> exhibit JSON.
 * Identity columns are positional; value columns use ASCII item codes.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RAW = path.join(ROOT, "data", "raw");
const OUT = path.join(ROOT, "data", "processed");

const SITE = "https://www.nstac.go.jp/use/literacy/ssdse/";
const FILES = "https://www.nstac.go.jp/files/";
const NATIONAL = "\u5168\u56fd";

function parseCSV(str) {
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let inQuotes = false;
  while (i < str.length) {
    const c = str[i];
    if (inQuotes) {
      if (c === '"') {
        if (str[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
      continue;
    }
    cell += c;
    i++;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function readSsdse(filename) {
  const buf = fs.readFileSync(path.join(RAW, filename));
  return parseCSV(new TextDecoder("shift_jis").decode(buf));
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function prefCodeFromRegion(code) {
  const digits = String(code || "").replace(/^R/, "");
  return digits.slice(0, 2);
}

function muniCodeFromRegion(code) {
  return String(code || "").replace(/^R/, "");
}

function indexCodes(row) {
  const idx = Object.create(null);
  row.forEach((c, i) => {
    if (c) idx[c] = i;
  });
  return idx;
}

function writeJson(name, obj) {
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, JSON.stringify(obj));
  return { name, bytes: fs.statSync(dest).size, rows: (obj.rows || []).length };
}

function buildC() {
  const rows = readSsdse("SSDSE-C-2026.csv");
  const idx = indexCodes(rows[0]);
  const names = rows[1];
  const col = (code) => ({ code, label: names[idx[code]] });
  const columns = {
    household: col("LA03"),
    food: col("LB00"),
    meat: col("LB03"),
    beef: col("LB031001"),
    pork: col("LB031002"),
    chicken: col("LB031003")
  };
  const dataRows = [];
  for (const r of rows.slice(2)) {
    const region = r[0];
    const pref = r[1];
    const city = r[2];
    if (region === "R00000" || pref === NATIONAL || city === NATIONAL) continue;
    dataRows.push({
      region,
      pref,
      city,
      prefCode: prefCodeFromRegion(region),
      household: num(r[idx.LA03]),
      food: num(r[idx.LB00]),
      meat: num(r[idx.LB03]),
      beef: num(r[idx.LB031001]),
      pork: num(r[idx.LB031002]),
      chicken: num(r[idx.LB031003])
    });
  }
  return writeJson("exhibit-c.json", {
    dataset: "SSDSE-C-2026",
    sourceUrl: SITE,
    csvUrl: FILES + "SSDSE-C-2026.csv",
    commentaryUrl: FILES + "kaisetsu-C-2026.pdf",
    originalStat: "\u7dcf\u52d9\u7701\u7d71\u8a08\u5c40\u300c\u5bb6\u8a08\u8abf\u67fb\u300d2023\u5e74\uff08\u4ee4\u548c5\u5e74\uff09\uff5e2025\u5e74\uff08\u4ee4\u548c7\u5e74\uff09",
    unit: "\u5186\uff081\u4e16\u5e2f\u5f53\u305f\u308a\u5e74\u9593\u652f\u51fa\u91d1\u984d\uff09",
    note: "\u5168\u56fd\u3092\u9664\u304f47\u90fd\u9053\u5e9c\u770c\u5e81\u6240\u5728\u5e02\u3002\u6771\u4eac\u90fd\u306f\u6771\u4eac\u90fd\u533a\u90e8\u3002",
    columns,
    rows: dataRows
  });
}

function buildE() {
  const rows = readSsdse("SSDSE-E-2026.csv");
  const idx = indexCodes(rows[0]);
  const years = rows[1];
  const labels = rows[2];
  const colMeta = (code) => ({
    code,
    label: labels[idx[code]],
    year: years[idx[code]]
  });
  const columns = {
    pop: colMeta("A1101"),
    doctors: colMeta("I6100"),
    dwellings: colMeta("H1100"),
    vacant: colMeta("H110202")
  };
  const dataRows = [];
  for (const r of rows.slice(3)) {
    const region = r[0];
    const pref = r[1];
    if (region === "R00000" || pref === NATIONAL) continue;
    const pop = num(r[idx.A1101]);
    const doctors = num(r[idx.I6100]);
    const dwellings = num(r[idx.H1100]);
    const vacant = num(r[idx.H110202]);
    dataRows.push({
      region,
      pref,
      prefCode: prefCodeFromRegion(region),
      pop,
      doctors,
      doctorsPer100k: pop && doctors != null ? (doctors / pop) * 1e5 : null,
      dwellings,
      vacant,
      vacantRate: dwellings && vacant != null ? (vacant / dwellings) * 100 : null
    });
  }
  return writeJson("exhibit-e.json", {
    dataset: "SSDSE-E-2026",
    sourceUrl: SITE,
    csvUrl: FILES + "SSDSE-E-2026.csv",
    commentaryUrl: FILES + "kaisetsu-E-2026.pdf",
    originalStat: "\u7dcf\u52d9\u7701\u7d71\u8a08\u5c40\u300c\u7d71\u8a08\u3067\u307f\u308b\u90fd\u9053\u5e9c\u770c\u30fb\u5e02\u533a\u753a\u6751\u306e\u3059\u304c\u305f\uff08\u793e\u4f1a\u30fb\u4eba\u53e3\u7d71\u8a08\u4f53\u7cfb\uff09\u300d",
    columns,
    rows: dataRows
  });
}

function buildA() {
  const rows = readSsdse("SSDSE-A-2026.csv");
  const idx = indexCodes(rows[0]);
  const years = rows[1];
  const labels = rows[2];
  const colMeta = (code) => ({
    code,
    label: labels[idx[code]],
    year: years[idx[code]]
  });
  const columns = {
    pop: colMeta("A1101"),
    young: colMeta("A1301"),
    old: colMeta("A1303")
  };
  const dataRows = [];
  for (const r of rows.slice(3)) {
    const region = r[0];
    const pref = r[1];
    const name = r[2];
    const pop = num(r[idx.A1101]);
    const young = num(r[idx.A1301]);
    const old = num(r[idx.A1303]);
    dataRows.push({
      region,
      pref,
      name,
      muniCode: muniCodeFromRegion(region),
      prefCode: prefCodeFromRegion(region),
      pop,
      young,
      old,
      agingPct: pop && old != null ? (old / pop) * 100 : null,
      youthPct: pop && young != null ? (young / pop) * 100 : null
    });
  }
  return writeJson("exhibit-a.json", {
    dataset: "SSDSE-A-2026",
    sourceUrl: SITE,
    csvUrl: FILES + "SSDSE-A-2026.csv",
    commentaryUrl: FILES + "kaisetsu-A-2026.pdf",
    originalStat: "\u7dcf\u52d9\u7701\u7d71\u8a08\u5c40\u300c\u7d71\u8a08\u3067\u307f\u308b\u90fd\u9053\u5e9c\u770c\u30fb\u5e02\u533a\u753a\u6751\u306e\u3059\u304c\u305f\uff08\u793e\u4f1a\u30fb\u4eba\u53e3\u7d71\u8a08\u4f53\u7cfb\uff09\u300d",
    note: "2020\u5e74\u56fd\u52e2\u8abf\u67fb\u306e\u4eba\u53e3\u30021741\u5e02\u533a\u753a\u6751\u3002",
    columns,
    rows: dataRows
  });
}

function buildB() {
  const rows = readSsdse("SSDSE-B-2026.csv");
  const idx = indexCodes(rows[0]);
  const labels = rows[1];
  const columns = {
    pop: { code: "A1101", label: labels[idx.A1101] },
    old: { code: "A1303", label: labels[idx.A1303] },
    tfr: { code: "A4103", label: labels[idx.A4103] }
  };
  const dataRows = [];
  for (const r of rows.slice(2)) {
    const year = num(r[0]);
    const region = r[1];
    const pref = r[2];
    const pop = num(r[idx.A1101]);
    const old = num(r[idx.A1303]);
    dataRows.push({
      year,
      region,
      pref,
      prefCode: prefCodeFromRegion(region),
      pop,
      old,
      tfr: num(r[idx.A4103]),
      agingPct: pop && old != null ? (old / pop) * 100 : null
    });
  }
  return writeJson("exhibit-b.json", {
    dataset: "SSDSE-B-2026",
    sourceUrl: SITE,
    csvUrl: FILES + "SSDSE-B-2026.csv",
    commentaryUrl: FILES + "kaisetsu-B-2026.pdf",
    originalStat: "\u7dcf\u52d9\u7701\u7d71\u8a08\u5c40\u300c\u7d71\u8a08\u3067\u307f\u308b\u90fd\u9053\u5e9c\u770c\u30fb\u5e02\u533a\u753a\u6751\u306e\u3059\u304c\u305f\uff08\u793e\u4f1a\u30fb\u4eba\u53e3\u7d71\u8a08\u4f53\u7cfb\uff09\u300d",
    years: [2012, 2023],
    columns,
    rows: dataRows
  });
}

function buildD() {
  const rows = readSsdse("SSDSE-D-2023.csv");
  const idx = indexCodes(rows[0]);
  const labels = rows[1];
  const columns = {
    pop10: { code: "MA00", label: labels[idx.MA00] },
    work: { code: "MG05", label: labels[idx.MG05] },
    housework: { code: "MG07", label: labels[idx.MG07] },
    childcare: { code: "MG09", label: labels[idx.MG09] }
  };
  const byPref = new Map();
  for (const r of rows.slice(2)) {
    const genderRaw = r[0];
    const region = r[1];
    const pref = r[2];
    if (region === "R00000" || pref === NATIONAL) continue;
    let rec = byPref.get(pref);
    if (!rec) {
      rec = {
        region,
        pref,
        prefCode: prefCodeFromRegion(region),
        pop10: num(r[idx.MA00])
      };
      byPref.set(pref, rec);
    }
    const payload = {
      housework: num(r[idx.MG07]),
      childcare: num(r[idx.MG09]),
      work: num(r[idx.MG05])
    };
    if (genderRaw.startsWith("0_")) rec.total = payload;
    else if (genderRaw.startsWith("1_")) rec.male = payload;
    else if (genderRaw.startsWith("2_")) rec.female = payload;
  }
  const dataRows = [...byPref.values()].map((rec) => ({
    ...rec,
    houseworkGap:
      rec.female && rec.male && rec.female.housework != null && rec.male.housework != null
        ? rec.female.housework - rec.male.housework
        : null
  }));
  return writeJson("exhibit-d.json", {
    dataset: "SSDSE-D-2023",
    sourceUrl: SITE,
    csvUrl: FILES + "SSDSE-D-2023.csv",
    commentaryUrl: FILES + "kaisetsu-D-2023.pdf",
    originalStat: "\u7dcf\u52d9\u7701\u7d71\u8a08\u5c40\u300c\u793e\u4f1a\u751f\u6d3b\u57fa\u672c\u8abf\u67fb\u300d2021\u5e74\uff08\u4ee4\u548c3\u5e74\uff09",
    unit: "\u5206\uff081\u65e5\u3042\u305f\u308a\u300110\u6b73\u4ee5\u4e0a\uff09",
    note: "\u5bb6\u4e8b\u306fMG07\u3002\u7537\u5973\u306e\u5225\u306f\u7dcf\u6570\u30fb\u7537\u30fb\u5973\u3002",
    columns,
    rows: dataRows
  });
}

function buildF() {
  const rows = readSsdse("SSDSE-F-2023v3.csv");
  const idx = indexCodes(rows[0]);
  const labels = rows[1];
  const columns = {
    temp: { code: "CN100", label: labels[idx.CN100] },
    sun: { code: "CN400", label: labels[idx.CN400] },
    rain: { code: "CN500", label: labels[idx.CN500] },
    lat: { code: "CN900", label: labels[idx.CN900] },
    lon: { code: "CN910", label: labels[idx.CN910] }
  };
  const cities = new Map();
  for (const r of rows.slice(2)) {
    const region = r[0];
    const pref = r[1];
    const city = r[2];
    const monthLabel = r[3];
    const monthMatch = /^(\d{1,2})/.exec(monthLabel || "");
    let rec = cities.get(city);
    if (!rec) {
      rec = {
        region,
        pref,
        city,
        prefCode: prefCodeFromRegion(region),
        lat: num(r[idx.CN900]),
        lon: num(r[idx.CN910]),
        months: []
      };
      cities.set(city, rec);
    }
    if (!monthMatch) continue;
    rec.months.push({
      month: Number(monthMatch[1]),
      temp: num(r[idx.CN100]),
      sun: num(r[idx.CN400]),
      rain: num(r[idx.CN500])
    });
  }
  for (const rec of cities.values()) {
    rec.months.sort((a, b) => a.month - b.month);
  }
  const dataRows = [...cities.values()].sort((a, b) => b.lat - a.lat);
  return writeJson("exhibit-f.json", {
    dataset: "SSDSE-F-2023v3",
    sourceUrl: SITE,
    csvUrl: FILES + "SSDSE-F-2023v3.csv",
    commentaryUrl: FILES + "kaisetsu-F-2023v3.pdf",
    originalStat: "\u6c17\u8c61\u5e81\u300c\u5730\u4e0a\u6c17\u8c61\u89b3\u6e2c\u7d71\u8a08\u300d2020\u5e74\u5e73\u5e74\u5024\uff08\u7b2c4.0.1\u7248\uff09\uff0f1991\u20132020\u5e74",
    note: "\u90fd\u9053\u5e9c\u770c\u5e81\u6240\u5728\u5e02\u306e\u6708\u5225\u5e73\u5e74\u5024\u3002\u5e74\u8a08\u306f\u542b\u307e\u306a\u3044\u3002",
    columns,
    rows: dataRows
  });
}

fs.mkdirSync(OUT, { recursive: true });

const written = [
  buildC(),
  buildE(),
  buildA(),
  buildB(),
  buildD(),
  buildF()
];

const meta = {
  generated: new Date().toISOString().slice(0, 10),
  versions: [
    "SSDSE-A-2026",
    "SSDSE-B-2026",
    "SSDSE-C-2026",
    "SSDSE-D-2023",
    "SSDSE-E-2026",
    "SSDSE-F-2023v3"
  ],
  sourceUrl: SITE,
  geo: {
    files: [
      "data/geo/ja_prefecture_area.topojson",
      "data/geo/ja_municipality_area_5.topojson"
    ],
    attribution: "\u56fd\u571f\u4ea4\u901a\u7701 \u56fd\u571f\u6570\u5024\u60c5\u5831\uff08\u884c\u653f\u533a\u57df\u30c7\u30fc\u30bf\uff09\u3092 K-Oxon/Japan-map-for-BI \u304c\u7c21\u7d20\u5316\u30fb\u7d50\u5408\u3057\u305f\u3082\u306e\uff08CC BY 4.0\uff09",
    sourceUrl: "https://nlftp.mlit.go.jp/ksj/",
    processed: "https://github.com/K-Oxon/Japan-map-for-BI"
  }
};
writeJson("meta.json", meta);
console.log(JSON.stringify({ written }, null, 2));
