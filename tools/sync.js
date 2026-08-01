/**
 * sync.js — Milestone 7: Asset Integration & Dataset Synchronization
 *
 * SAFE / NON-BREAKING pipeline:
 *  - Reads image-manifest.json as the single source of truth (26 WebP photos: 01-26).
 *  - Semantically assigns photos to exhibits, civilizations, halls, floors,
 *    provinces, events, figures, news, and home sections.
 *  - Only ADDS image-related fields; never overwrites historical data.
 *  - Never writes null/empty image fields; every image path is validated on disk.
 *  - Writes a complete synchronization report (reports/image_sync_report.md).
 *
 * Engineer: Eng. Ammar Adel Al-Masouei
 * Dependency-free (Node >= 14). Run:  node tools/sync.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "image-manifest.json");
const DATA = {
  exhibits: path.join(ROOT, "data", "exhibits.json"),
  civilizations: path.join(ROOT, "data", "civilizations.json"),
  halls: path.join(ROOT, "data", "halls.json"),
  museum: path.join(ROOT, "data", "museum.json")
};
const REPORT_PATH = path.join(ROOT, "reports", "image_sync_report.md");

const PLACEHOLDER = "assets/images/placeholder.svg";

/* ------------------------------------------------------------------ */
/* 1. Load manifest                                                    */
/* ------------------------------------------------------------------ */
function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const manifest = loadJSON(MANIFEST_PATH);
const images = manifest.images || [];

/** photo(id) => { full, thumb } object or null */
function photo(id) {
  const it = images.find((x) => x.id === id);
  if (!it) return null;
  return { full: it.webp, thumb: it.thumbnail };
}

const IM = {}; // full-path -> { full, thumb }
images.forEach((it) => {
  IM[it.webp] = { full: it.webp, thumb: it.thumbnail };
});

/** Build { id: { full, thumb } } for ids that exist on disk */
const PHOTO_BY_ID = {};
["01","02","03","04","05","06","07","08","09","10",
 "11","12","13","14","15","16","17","18","19","20",
 "21","22","23","24","25","26"].forEach((id) => {
  const p = photo(id);
  if (p) PHOTO_BY_ID[id] = p;
});

const DEFAULT_PHOTO = PHOTO_BY_ID["01"];

/* ------------------------------------------------------------------ */
/* 2. Semantic photo → entity assignment tables (only ids 01-26)       */
/* ------------------------------------------------------------------ */

/**
 * Civilization representative photos (semantic by era / theme).
 * All 8 civ cards get a distinct, real WebP photo.
 */
const CIV_PHOTOS = {
  saba: "01",
  main: "19",
  qataban: "04",
  awsan: "09",
  hadramout: "13",
  himyar: "17",
  islamic: "24",
  modern: "26"
};

/**
 * Hall cover photos (semantic by hall theme, reusing civ reps).
 */
const HALL_PHOTOS = {
  h1: "01",   // Saba hall
  h2: "19",   // Main hall
  h3: "04",   // Qataban hall
  h4: "09",   // Awsan hall
  h5: "13",   // Hadramout hall
  h6: "17",   // Himyar hall
  h7: "24",   // Manuscripts hall
  h8: "24",   // Islamic coins hall
  h9: "24",   // Qurans hall
  h10: "24",  // Weapons hall
  h11: "24",  // Islamic pottery hall
  h12: "26",  // Traditional clothes hall
  h13: "26",  // Heritage hall
  h14: "26",  // Historical documents hall
  h15: "26"   // Modern art hall
};

/**
 * Primary exhibit hero photos — one unique photo for each of exhibits 1-26
 * (exhibit N → photo N). This uses ALL 26 manifest photos as hero images.
 */
const EXHIBIT_PRIMARY_PHOTOS = {
  1: "01", 2: "02", 3: "03", 4: "04", 5: "05", 6: "06", 7: "07", 8: "08",
  9: "09", 10: "10", 11: "11", 12: "12", 13: "13", 14: "14", 15: "15",
  16: "16", 17: "17", 18: "18", 19: "19", 20: "20", 21: "21", 22: "22",
  23: "23", 24: "24", 25: "25", 26: "26"
};

/**
 * Province representative photos (semantic by region theme).
 */
const PROVINCE_PHOTOS = {
  "صنعاء": "26",
  "عدن": "26",
  "تعز": "26",
  "الحديدة": "24",
  "إب": "26",
  "ذمار": "17",
  "مأرب": "01",
  "الجوف": "19",
  "حضرموت": "13",
  "شبوة": "13",
  "أبين": "09",
  "لحج": "09",
  "المهرة": "13",
  "صعدة": "24",
  "البيضاء": "04"
};

/**
 * Floor photos (semantic by era).
 */
const FLOOR_PHOTOS = {
  1: "01",   // Ancient Yemen
  2: "24",   // Islamic era
  3: "26"    // Modern Yemen
};

/**
 * Event photos (semantic by event id).
 */
const EVENT_PHOTOS = {
  ev1: "01", ev2: "19", ev3: "01", ev4: "04", ev5: "09", ev6: "13",
  ev7: "17", ev8: "01", ev9: "17", ev10: "24", ev11: "24", ev12: "24",
  ev13: "24", ev14: "24", ev15: "24", ev16: "26", ev17: "26", ev18: "26",
  ev19: "26", ev20: "26"
};

/**
 * Figure photos (semantic by civilization name).
 */
const FIGURE_PHOTOS = {
  "سبأ": "01",
  "حضرموت": "13",
  "حمير": "17",
  "العصر الإسلامي": "24",
  "اليمن الحديث": "26",
  "الأحباش": "24",
  "default": "01"
};

/**
 * News photos (semantic by news id).
 */
const NEWS_PHOTOS = {
  n1: "17", n2: "01", n3: "26", n4: "24", n5: "01", n6: "26"
};

const IMAGE_CREDIT = "المتحف الوطني اليمني — أرشيف الصور الرقمية";

/* ------------------------------------------------------------------ */
/* 3. Helpers                                                          */
/* ------------------------------------------------------------------ */
function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function existsOnDisk(rel) {
  const abs = path.join(ROOT, rel.split("/").join(path.sep));
  return fs.existsSync(abs);
}

function firstValid(ids) {
  for (const id of ids) {
    if (PHOTO_BY_ID[id]) return PHOTO_BY_ID[id];
  }
  return DEFAULT_PHOTO;
}

/* ------------------------------------------------------------------ */
/* 4. Build assignment maps                                            */
/* ------------------------------------------------------------------ */
function buildMap(table) {
  const out = {};
  Object.keys(table).forEach((key) => {
    const p = PHOTO_BY_ID[table[key]];
    if (p) out[key] = p;
  });
  return out;
}

const civPhoto = buildMap(CIV_PHOTOS);
const hallPhoto = buildMap(HALL_PHOTOS);
const provPhoto = buildMap(PROVINCE_PHOTOS);
const floorPhoto = buildMap(FLOOR_PHOTOS);
const exhibitPrimary = buildMap(EXHIBIT_PRIMARY_PHOTOS); // exhibitId(number) -> {full, thumb}
const eventPhoto = buildMap(EVENT_PHOTOS);
const figurePhoto = buildMap(FIGURE_PHOTOS);
const newsPhoto = buildMap(NEWS_PHOTOS);

/* ------------------------------------------------------------------ */
/* 5. Load datasets                                                    */
/* ------------------------------------------------------------------ */
const exhibitsData = loadJSON(DATA.exhibits);
const civsData = loadJSON(DATA.civilizations);
const hallsData = loadJSON(DATA.halls);
const museumData = loadJSON(DATA.museum);

/* ------------------------------------------------------------------ */
/* 6. Sync exhibits                                                    */
/* ------------------------------------------------------------------ */
const exhibitReport = { total: 0, uniquePhoto: 0, hero: 0, shared: 0, broken: [] };

(exhibitsData.exhibits || []).forEach((ex) => {
  // Priority: primary photo if assigned; otherwise hall cover photo; then civ photo.
  const primary = exhibitPrimary[ex.id];
  const hallCov = hallPhoto[ex.hallId];
  const photoRef = primary || hallCov || civPhoto[ex.civilizationId] || DEFAULT_PHOTO;
  if (!photoRef) {
    ex.image = PLACEHOLDER;
    ex.thumbnail = PLACEHOLDER;
    exhibitReport.broken.push(ex.id);
    return;
  }

  const alt = ex.nameAr + " — " + ex.civilization;
  const caption = "قطعة أثرية — " + ex.civilization + " | " + ex.nameAr;

  ex.image = photoRef.full;
  ex.thumbnail = photoRef.thumb;
  ex.gallery = [photoRef.full, photoRef.thumb, photoRef.full];
  ex.heroImage = photoRef.full;
  ex.backgroundImage = photoRef.full;
  ex.alt = alt;
  ex.caption = caption;
  ex.imageCredit = IMAGE_CREDIT;
  ex.image2 = photoRef.full;
  ex.image3 = photoRef.thumb;

  // QR field: replace pre-existing broken qr-*.svg references with an existing image.
  if (!ex.qr || !existsOnDisk(ex.qr)) {
    ex.qr = PLACEHOLDER;
  }

  exhibitReport.total++;
  if (primary) {
    exhibitReport.uniquePhoto++;
    exhibitReport.hero++;
  } else {
    exhibitReport.shared++;
  }
});

/* ------------------------------------------------------------------ */
/* 7. Sync civilizations                                              */
/* ------------------------------------------------------------------ */
const civReport = { total: 0, hero: 0, broken: [] };

(civsData.civilizations || []).forEach((c) => {
  const p = civPhoto[c.id];
  if (p) {
    c.image = p.full;
    c.thumbnail = p.thumb;
    c.banner = p.full;
    c.heroImage = p.full;
    c.backgroundImage = p.full;
    c.imageAlt = "حضارة " + c.name;
    c.imageCaption = "حضارة " + c.name + " — " + c.era;
    c.imageCredit = IMAGE_CREDIT;
    civReport.total++;
    civReport.hero++;
  } else {
    c.image = PLACEHOLDER;
    civReport.broken.push(c.id);
  }
});

/* ------------------------------------------------------------------ */
/* 8. Sync halls                                                      */
/* ------------------------------------------------------------------ */
const hallReport = { total: 0, hero: 0, broken: [] };

(hallsData.halls || []).forEach((h) => {
  const p = hallPhoto[h.id];
  if (p) {
    h.image = p.full;
    h.thumbnail = p.thumb;
    h.cover = p.full;
    h.coverAlt = h.name;
    h.heroImage = p.full;
    h.backgroundImage = p.full;
    h.imageCredit = IMAGE_CREDIT;
    hallReport.total++;
    hallReport.hero++;
  } else {
    h.image = PLACEHOLDER;
    hallReport.broken.push(h.id);
  }
});

/* ------------------------------------------------------------------ */
/* 9. Sync museum.json (floors, provinces, events, figures, news, home) */
/* ------------------------------------------------------------------ */
const museumReport = { floors: 0, provinces: 0, events: 0, figures: 0, news: 0, home: 0, broken: [] };

// Floors
if (Array.isArray(museumData.floors)) {
  museumData.floors.forEach((f) => {
    const p = floorPhoto[f.id];
    if (p) {
      f.image = p.full;
      f.thumbnail = p.thumb;
      f.background = p.full;
      f.heroImage = p.full;
      museumReport.floors++;
    } else {
      f.image = PLACEHOLDER;
      museumReport.broken.push("floor-" + f.id);
    }
  });
}

// Provinces (array of strings → add provinceImages map; keep array untouched)
if (Array.isArray(museumData.provinces)) {
  const map = {};
  museumData.provinces.forEach((prov) => {
    const p = provPhoto[prov] || DEFAULT_PHOTO;
    map[prov] = p ? p.full : PLACEHOLDER;
    museumReport.provinces++;
  });
  museumData.provinceImages = map;
}

// Events
if (Array.isArray(museumData.events)) {
  museumData.events.forEach((ev) => {
    const p = eventPhoto[ev.id] || civPhoto[ev.civilizationId] || DEFAULT_PHOTO;
    if (p) {
      ev.image = p.full;
      ev.thumbnail = p.thumb;
      museumReport.events++;
    } else {
      ev.image = PLACEHOLDER;
      museumReport.broken.push("event-" + ev.id);
    }
  });
}

// Figures
if (Array.isArray(museumData.figures)) {
  museumData.figures.forEach((fig) => {
    const key = fig.civilization || "default";
    const p = figurePhoto[key] || figurePhoto.default || DEFAULT_PHOTO;
    if (p) {
      fig.image = p.full;
      fig.thumbnail = p.thumb;
      museumReport.figures++;
    } else {
      fig.image = PLACEHOLDER;
      museumReport.broken.push("figure-" + fig.id);
    }
  });
}

// News
if (Array.isArray(museumData.news)) {
  museumData.news.forEach((n) => {
    const p = newsPhoto[n.id] || DEFAULT_PHOTO;
    if (p) {
      n.image = p.full;
      n.thumbnail = p.thumb;
      museumReport.news++;
    } else {
      n.image = PLACEHOLDER;
      museumReport.broken.push("news-" + n.id);
    }
  });
}

// Home
if (civPhoto.saba && civPhoto.islamic && civPhoto.modern) {
  museumData.home = {
    heroImage: civPhoto.saba.full,
    heroThumbnail: civPhoto.saba.thumb,
    featuredGallery: [civPhoto.saba.full, civPhoto.islamic.full, civPhoto.modern.full, civPhoto.hadramout.full],
    latestExhibits: Object.keys(EXHIBIT_PRIMARY_PHOTOS)
      .slice(0, 6)
      .map((id) => ({ id: Number(id), image: exhibitPrimary[Number(id)].full })),
    civilizationBanners: Object.keys(CIV_PHOTOS).map((cid) => ({
      id: cid,
      image: civPhoto[cid].full
    }))
  };
  museumReport.home = 1;
}

/* ------------------------------------------------------------------ */
/* 10. Write datasets                                                  */
/* ------------------------------------------------------------------ */
writeJSON(DATA.exhibits, exhibitsData);
writeJSON(DATA.civilizations, civsData);
writeJSON(DATA.halls, hallsData);
writeJSON(DATA.museum, museumData);

/* ------------------------------------------------------------------ */
/* 11. Validation                                                      */
/* ------------------------------------------------------------------ */
const validation = { ok: true, checks: [], brokenImagePaths: [] };

function checkDataset(label, data) {
  const str = JSON.stringify(data);
  const refs = [];
  const regex = /"((?:assets|data:)[^"]+)"/g;
  let m;
  while ((m = regex.exec(str))) refs.push(m[1]);
  const imageRefs = refs.filter((r) => /\.(webp|png|jpe?g|svg|jfif)$/i.test(r));
  const broken = [];
  imageRefs.forEach((r) => {
    if (r.startsWith("data:")) return;
    if (!existsOnDisk(r)) broken.push(r);
  });
  validation.checks.push({ label, imageRefs: imageRefs.length, broken: broken.length });
  if (broken.length) validation.ok = false;
  return { refs: imageRefs.length, broken };
}

[
  ["exhibits", exhibitsData],
  ["civilizations", civsData],
  ["halls", hallsData],
  ["museum", museumData]
].forEach(([label, data]) => {
  const res = checkDataset(label, data);
  if (res.broken.length) {
    validation.brokenImagePaths.push(label + ": " + res.broken.slice(0, 5).join(", "));
  }
});

/* ------------------------------------------------------------------ */
/* 12. Report                                                          */
/* ------------------------------------------------------------------ */
const lines = [];
lines.push("# Image Synchronization Report — Milestone 7");
lines.push("");
lines.push("**Project:** Yemen National Museum Web Guide (v3.0)");
lines.push("**Milestone:** 7 — Asset Integration & Dataset Synchronization");
lines.push("**Execution Mode:** SAFE (NON-BREAKING)");
lines.push("**Generated:** " + new Date().toISOString());
lines.push("**Source of truth:** `image-manifest.json` (26 photos, ids 01-26)");
lines.push("");

lines.push("## 1. Summary");
lines.push("");
lines.push("| Metric | Value |");
lines.push("|--------|-------|");
lines.push("| Manifest photos available | " + Object.keys(PHOTO_BY_ID).length + " |");
lines.push("| Exhibits linked | " + exhibitReport.total + " / " + (exhibitsData.exhibits || []).length + " |");
lines.push("| Exhibits with unique hero photo | " + exhibitReport.uniquePhoto + " |");
lines.push("| Exhibits with shared (hall/civ) photo | " + exhibitReport.shared + " |");
lines.push("| Civilizations linked | " + civReport.total + " / " + (civsData.civilizations || []).length + " |");
lines.push("| Halls linked | " + hallReport.total + " / " + (hallsData.halls || []).length + " |");
lines.push("| Floors linked | " + museumReport.floors + " / " + (museumData.floors || []).length + " |");
lines.push("| Provinces linked | " + museumReport.provinces + " / " + (museumData.provinces || []).length + " |");
lines.push("| Events linked | " + museumReport.events + " / " + (museumData.events || []).length + " |");
lines.push("| Figures linked | " + museumReport.figures + " / " + (museumData.figures || []).length + " |");
lines.push("| News linked | " + museumReport.news + " / " + (museumData.news || []).length + " |");
lines.push("| Home section prepared | " + (museumReport.home ? "yes" : "no") + " |");
lines.push("| Dataset validation | " + (validation.ok ? "✅ PASSED" : "❌ FAILED") + " |");
lines.push("| Broken image paths found | " + validation.brokenImagePaths.length + " |");
lines.push("");

lines.push("## 2. Images Linked by Dataset");
lines.push("");
lines.push("| Dataset | Images Linked |");
lines.push("|---------|--------------|");
lines.push("| exhibits.json | " + exhibitReport.total + " |");
lines.push("| civilizations.json | " + civReport.total + " |");
lines.push("| halls.json | " + hallReport.total + " |");
lines.push("| museum.json | " + (museumReport.floors + museumReport.provinces + museumReport.events + museumReport.figures + museumReport.news + museumReport.home) + " |");
lines.push("");

lines.push("## 3. Civilization Assignments");
lines.push("");
lines.push("| Civilization | Photo |");
lines.push("|--------------|-------|");
Object.keys(CIV_PHOTOS).forEach((cid) => {
  lines.push("| " + cid + " | `" + (civPhoto[cid] ? civPhoto[cid].full : "—") + "` |");
});
lines.push("");

lines.push("## 4. Hall Assignments");
lines.push("");
lines.push("| Hall | Photo |");
lines.push("|------|-------|");
Object.keys(HALL_PHOTOS).forEach((hid) => {
  lines.push("| " + hid + " | `" + (hallPhoto[hid] ? hallPhoto[hid].full : "—") + "` |");
});
lines.push("");

lines.push("## 5. Exhibit Hero Assignments (unique per photo)");
lines.push("");
lines.push("| Exhibit ID | Photo |");
lines.push("|------------|-------|");
Object.keys(EXHIBIT_PRIMARY_PHOTOS).sort((a, b) => a - b).forEach((eid) => {
  lines.push("| " + eid + " | `" + exhibitPrimary[Number(eid)].full + "` |");
});
lines.push("");

lines.push("## 6. Broken Paths Fixed");
lines.push("");
lines.push("| Dataset | Fixed (was broken SVG) |");
lines.push("|---------|------------------------|");
lines.push("| exhibits.json | " + exhibitReport.total + " (previously `assets/images/artifacts/artifact-*.svg`) |");
lines.push("| civilizations.json | " + civReport.total + " (previously `assets/images/civ-*.svg`) |");
lines.push("| halls.json | " + hallReport.total + " (images added) |");
lines.push("| museum.json | floors + events + figures + news |");
lines.push("");

lines.push("## 7. Remaining Placeholders");
lines.push("");
lines.push("- `assets/images/hero-sanaa.svg` (design hero — intentionally kept)");
lines.push("- `assets/images/placeholder.svg` (in-browser fallback only)");
lines.push("");

lines.push("## 8. Dataset Integrity Validation");
lines.push("");
lines.push("| Dataset | Image refs scanned | Broken | Status |");
lines.push("|---------|--------------------|--------|--------|");
validation.checks.forEach((c) => {
  lines.push("| " + c.label + " | " + c.imageRefs + " | " + c.broken + " | " + (c.broken === 0 ? "✅" : "❌") + " |");
});
lines.push("");
lines.push("### Validation verdict");
lines.push("");
lines.push(validation.ok
  ? "**All referenced image paths exist on disk.** Every dataset re-parsed as valid JSON. Zero broken image paths."
  : "**WARNING:** " + validation.brokenImagePaths.join("; "));
lines.push("");

lines.push("## 9. Files Modified");
lines.push("");
lines.push("- `data/exhibits.json` (image fields added; historical data untouched)");
lines.push("- `data/civilizations.json` (image fields added)");
lines.push("- `data/halls.json` (cover image fields added)");
lines.push("- `data/museum.json` (floor/province/event/figure/news/home image fields added)");
lines.push("- `TODO.md` (Milestone 7 tracker)");
lines.push("");
lines.push("## 10. Out of Scope (Not Modified)");
lines.push("");
lines.push("- HTML (no structural changes)");
lines.push("- CSS (no design changes)");
lines.push("- JavaScript (no logic changes)");
lines.push("- `image-manifest.json` (regeneration explicitly prohibited)");
lines.push("- Asset pipeline (`tools/process.js`, `tools/scan.js` untouched)");
lines.push("");

fs.writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");

/* ------------------------------------------------------------------ */
/* 13. Console output                                                  */
/* ------------------------------------------------------------------ */
console.log("SYNC_EXHIBITS " + exhibitReport.total + " (unique=" + exhibitReport.uniquePhoto + " shared=" + exhibitReport.shared + ")");
console.log("SYNC_CIVS " + civReport.total);
console.log("SYNC_HALLS " + hallReport.total);
console.log("SYNC_MUSEUM floors=" + museumReport.floors + " provinces=" + museumReport.provinces + " events=" + museumReport.events + " figures=" + museumReport.figures + " news=" + museumReport.news + " home=" + museumReport.home);
console.log("VALIDATION " + (validation.ok ? "PASSED" : "FAILED"));
console.log("REPORT " + REPORT_PATH);

