/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — database/init.js
   Creates the SQLite database, applies the schema, and
   auto-imports every existing JSON dataset into SQLite.
   Records are imported idempotently — re-running preserves
   user-submitted contact_messages and re-syncs museum data.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const ROOT = path.resolve(__dirname, "..", "..");          // project root
const DATA_DIR = path.join(ROOT, "data");
const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, "museum.db");
const SCHEMA_PATH = path.join(DB_DIR, "schema.sql");

/* ---------- Helpers ---------- */
function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) {
    console.warn("  [warn] Missing data file:", file);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function json(v) {
  return v == null ? null : JSON.stringify(v);
}

function parseArray(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function str(v) {
  return v == null ? null : String(v);
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/* ---------- Importers ---------- */
function importCivilizations(db, list) {
  const upsert = db.prepare(`
    INSERT INTO civilizations (
      id, name, nameEn, era, capital, province, icon, description,
      history, keySites, artifactsCount, image, hallId, achievements,
      thumbnail, banner, heroImage, backgroundImage, imageAlt, imageCaption, imageCredit
    ) VALUES (
      @id, @name, @nameEn, @era, @capital, @province, @icon, @description,
      @history, @keySites, @artifactsCount, @image, @hallId, @achievements,
      @thumbnail, @banner, @heroImage, @backgroundImage, @imageAlt, @imageCaption, @imageCredit
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, nameEn = excluded.nameEn, era = excluded.era,
      capital = excluded.capital, province = excluded.province, icon = excluded.icon,
      description = excluded.description, history = excluded.history,
      keySites = excluded.keySites, artifactsCount = excluded.artifactsCount,
      image = excluded.image, hallId = excluded.hallId, achievements = excluded.achievements,
      thumbnail = excluded.thumbnail, banner = excluded.banner, heroImage = excluded.heroImage,
      backgroundImage = excluded.backgroundImage, imageAlt = excluded.imageAlt,
      imageCaption = excluded.imageCaption, imageCredit = excluded.imageCredit
  `);
  const tx = db.transaction((rows) => {
    for (const c of rows) {
      upsert.run({
        id: str(c.id),
        name: str(c.name),
        nameEn: str(c.nameEn),
        era: str(c.era),
        capital: str(c.capital),
        province: str(c.province),
        icon: str(c.icon),
        description: str(c.description),
        history: str(c.history),
        keySites: json(c.keySites),
        artifactsCount: num(c.artifactsCount),
        image: str(c.image),
        hallId: str(c.hallId),
        achievements: json(c.achievements),
        thumbnail: str(c.thumbnail),
        banner: str(c.banner),
        heroImage: str(c.heroImage),
        backgroundImage: str(c.backgroundImage),
        imageAlt: str(c.imageAlt),
        imageCaption: str(c.imageCaption),
        imageCredit: str(c.imageCredit)
      });
    }
  });
  tx(list);
  return list.length;
}

function importCategories(db, list) {
  const upsert = db.prepare(`
    INSERT INTO categories (id, name, nameEn, icon)
    VALUES (@id, @name, @nameEn, @icon)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, nameEn = excluded.nameEn, icon = excluded.icon
  `);
  const tx = db.transaction((rows) => {
    for (const c of rows) {
      upsert.run({ id: str(c.id), name: str(c.name), nameEn: str(c.nameEn), icon: str(c.icon) });
    }
  });
  tx(list);
  return list.length;
}

function importProvinces(db, list) {
  const insert = db.prepare(`INSERT OR IGNORE INTO provinces (name) VALUES (?)`);
  const tx = db.transaction((rows) => {
    for (const p of rows) insert.run(str(p));
  });
  tx(list);
  return db.prepare(`SELECT COUNT(*) AS c FROM provinces`).get().c;
}

function importFloors(db, list) {
  const upsert = db.prepare(`
    INSERT INTO floors (id, name, nameEn, theme, themeEn, description, icon, halls, image, thumbnail, background, heroImage)
    VALUES (@id, @name, @nameEn, @theme, @themeEn, @description, @icon, @halls, @image, @thumbnail, @background, @heroImage)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, nameEn = excluded.nameEn, theme = excluded.theme,
      themeEn = excluded.themeEn, description = excluded.description, icon = excluded.icon,
      halls = excluded.halls, image = excluded.image, thumbnail = excluded.thumbnail,
      background = excluded.background, heroImage = excluded.heroImage
  `);
  const tx = db.transaction((rows) => {
    for (const f of rows) {
      upsert.run({
        id: num(f.id),
        name: str(f.name),
        nameEn: str(f.nameEn),
        theme: str(f.theme),
        themeEn: str(f.themeEn),
        description: str(f.description),
        icon: str(f.icon),
        halls: json(f.halls),
        image: str(f.image),
        thumbnail: str(f.thumbnail),
        background: str(f.background),
        heroImage: str(f.heroImage)
      });
    }
  });
  tx(list);
  return list.length;
}

function importHalls(db, list) {
  const upsert = db.prepare(`
    INSERT INTO halls (
      id, number, name, nameEn, floor, civilization, theme, description,
      size, capacity, artifacts, location, features, image, thumbnail,
      cover, coverAlt, heroImage, backgroundImage, imageCredit
    ) VALUES (
      @id, @number, @name, @nameEn, @floor, @civilization, @theme, @description,
      @size, @capacity, @artifacts, @location, @features, @image, @thumbnail,
      @cover, @coverAlt, @heroImage, @backgroundImage, @imageCredit
    )
    ON CONFLICT(id) DO UPDATE SET
      number = excluded.number, name = excluded.name, nameEn = excluded.nameEn,
      floor = excluded.floor, civilization = excluded.civilization, theme = excluded.theme,
      description = excluded.description, size = excluded.size, capacity = excluded.capacity,
      artifacts = excluded.artifacts, location = excluded.location, features = excluded.features,
      image = excluded.image, thumbnail = excluded.thumbnail, cover = excluded.cover,
      coverAlt = excluded.coverAlt, heroImage = excluded.heroImage,
      backgroundImage = excluded.backgroundImage, imageCredit = excluded.imageCredit
  `);
  const tx = db.transaction((rows) => {
    for (const h of rows) {
      upsert.run({
        id: str(h.id),
        number: num(h.number),
        name: str(h.name),
        nameEn: str(h.nameEn),
        floor: num(h.floor),
        civilization: str(h.civilization),
        theme: str(h.theme),
        description: str(h.description),
        size: num(h.size),
        capacity: num(h.capacity),
        artifacts: num(h.artifacts),
        location: str(h.location),
        features: json(h.features),
        image: str(h.image),
        thumbnail: str(h.thumbnail),
        cover: str(h.cover),
        coverAlt: str(h.coverAlt),
        heroImage: str(h.heroImage),
        backgroundImage: str(h.backgroundImage),
        imageCredit: str(h.imageCredit)
      });
    }
  });
  tx(list);
  return list.length;
}

function importExhibits(db, list) {
  const upsert = db.prepare(`
    INSERT INTO exhibits (
      id, name, nameAr, nameEn, description, civilization, civilizationId,
      era, century, category, categoryId, material, province, discoveryLocation,
      discoveryDate, floor, hall, position, image, gallery, model3d, qr,
      audioGuide, related, featured, date, thumbnail, heroImage, backgroundImage,
      alt, caption, imageCredit, image2, image3
    ) VALUES (
      @id, @name, @nameAr, @nameEn, @description, @civilization, @civilizationId,
      @era, @century, @category, @categoryId, @material, @province, @discoveryLocation,
      @discoveryDate, @floor, @hall, @position, @image, @gallery, @model3d, @qr,
      @audioGuide, @related, @featured, @date, @thumbnail, @heroImage, @backgroundImage,
      @alt, @caption, @imageCredit, @image2, @image3
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, nameAr = excluded.nameAr, nameEn = excluded.nameEn,
      description = excluded.description, civilization = excluded.civilization,
      civilizationId = excluded.civilizationId, era = excluded.era, century = excluded.century,
      category = excluded.category, categoryId = excluded.categoryId, material = excluded.material,
      province = excluded.province, discoveryLocation = excluded.discoveryLocation,
      discoveryDate = excluded.discoveryDate, floor = excluded.floor, hall = excluded.hall,
      position = excluded.position, image = excluded.image, gallery = excluded.gallery,
      model3d = excluded.model3d, qr = excluded.qr, audioGuide = excluded.audioGuide,
      related = excluded.related, featured = excluded.featured, date = excluded.date,
      thumbnail = excluded.thumbnail, heroImage = excluded.heroImage,
      backgroundImage = excluded.backgroundImage, alt = excluded.alt, caption = excluded.caption,
      imageCredit = excluded.imageCredit, image2 = excluded.image2, image3 = excluded.image3
  `);
  const tx = db.transaction((rows) => {
    for (const x of rows) {
      upsert.run({
        id: num(x.id),
        name: str(x.name),
        nameAr: str(x.nameAr),
        nameEn: str(x.nameEn),
        description: str(x.description),
        civilization: str(x.civilization),
        civilizationId: str(x.civilizationId),
        era: str(x.era),
        century: str(x.century),
        category: str(x.category),
        categoryId: str(x.categoryId),
        material: str(x.material),
        province: str(x.province),
        discoveryLocation: str(x.discoveryLocation),
        discoveryDate: str(x.discoveryDate),
        floor: num(x.floor),
        hall: str(x.hall),
        position: str(x.position),
        image: str(x.image),
        gallery: json(x.gallery),
        model3d: str(x.model3d),
        qr: str(x.qr),
        audioGuide: str(x.audioGuide),
        related: json(x.related),
        featured: x.featured ? 1 : 0,
        date: str(x.date),
        thumbnail: str(x.thumbnail),
        heroImage: str(x.heroImage),
        backgroundImage: str(x.backgroundImage),
        alt: str(x.alt),
        caption: str(x.caption),
        imageCredit: str(x.imageCredit),
        image2: str(x.image2),
        image3: str(x.image3)
      });
    }
  });
  tx(list);
  return list.length;
}

function importEvents(db, list) {
  const upsert = db.prepare(`
    INSERT INTO events (id, year, title, description, image, thumbnail)
    VALUES (@id, @year, @title, @description, @image, @thumbnail)
    ON CONFLICT(id) DO UPDATE SET
      year = excluded.year, title = excluded.title, description = excluded.description,
      image = excluded.image, thumbnail = excluded.thumbnail
  `);
  const tx = db.transaction((rows) => {
    for (const ev of rows) {
      upsert.run({
        id: str(ev.id),
        year: str(ev.year),
        title: str(ev.title),
        description: str(ev.description),
        image: str(ev.image),
        thumbnail: str(ev.thumbnail)
      });
    }
  });
  tx(list);
  return list.length;
}

function importFigures(db, list) {
  const upsert = db.prepare(`
    INSERT INTO figures (id, name, role, civilization, period, description, image, thumbnail)
    VALUES (@id, @name, @role, @civilization, @period, @description, @image, @thumbnail)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, role = excluded.role, civilization = excluded.civilization,
      period = excluded.period, description = excluded.description,
      image = excluded.image, thumbnail = excluded.thumbnail
  `);
  const tx = db.transaction((rows) => {
    for (const fg of rows) {
      upsert.run({
        id: str(fg.id),
        name: str(fg.name),
        role: str(fg.role),
        civilization: str(fg.civilization),
        period: str(fg.period),
        description: str(fg.description),
        image: str(fg.image),
        thumbnail: str(fg.thumbnail)
      });
    }
  });
  tx(list);
  return list.length;
}

function importUsers(db, list) {
  const upsert = db.prepare(`
    INSERT INTO users (
      id, username, password, name, nameEn, email, role, avatar, joined,
      favorites, notes, preferences, permissions
    ) VALUES (
      @id, @username, @password, @name, @nameEn, @email, @role, @avatar, @joined,
      @favorites, @notes, @preferences, @permissions
    )
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username, password = excluded.password, name = excluded.name,
      nameEn = excluded.nameEn, email = excluded.email, role = excluded.role,
      avatar = excluded.avatar, joined = excluded.joined, favorites = excluded.favorites,
      notes = excluded.notes, preferences = excluded.preferences, permissions = excluded.permissions
  `);
  const tx = db.transaction((rows) => {
    for (const u of rows) {
      upsert.run({
        id: str(u.id),
        username: str(u.username),
        password: str(u.password),
        name: str(u.name),
        nameEn: str(u.nameEn),
        email: str(u.email),
        role: str(u.role),
        avatar: str(u.avatar),
        joined: str(u.joined),
        favorites: json(u.favorites),
        notes: json(u.notes),
        preferences: json(u.preferences),
        permissions: json(u.permissions)
      });
    }
  });
  tx(list);
  return list.length;
}

/* ---------- Museum meta ---------- */
function importMuseumMeta(db, museum) {
  const insert = db.prepare(`
    INSERT INTO museum_meta (id, data) VALUES (1, @data)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data
  `);
  insert.run({ data: json(museum) });
}

/* ---------- Main ---------- */
function init() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  db.exec(schema);

  console.log("==============================================");
  console.log("YEMEN NATIONAL MUSEUM — SQLite Import");
  console.log("==============================================");

  // data/civilizations.json
  const civFile = readJSON("civilizations.json");
  const civs = civFile && civFile.civilizations ? civFile.civilizations : [];
  const civCount = importCivilizations(db, civs);
  console.log("civilizations     :", civCount, "records");

  // data/museum.json
  const museum = readJSON("museum.json");
  if (museum) {
    importMuseumMeta(db, museum);
    console.log("museum_meta       : 1 record (meta/stats/news/map/home)");

    const cats = museum.categories || [];
    console.log("categories        :", importCategories(db, cats), "records");

    const provs = museum.provinces || [];
    console.log("provinces         :", importProvinces(db, provs), "records");

    const floors = museum.floors || [];
    console.log("floors            :", importFloors(db, floors), "records");

    const events = museum.events || [];
    console.log("events            :", importEvents(db, events), "records");

    const figures = museum.figures || [];
    console.log("figures           :", importFigures(db, figures), "records");
  } else {
    console.warn("  [warn] data/museum.json not found — skipped meta/categories/provinces/floors/events/figures");
  }

  // data/halls.json
  const hallsFile = readJSON("halls.json");
  const halls = hallsFile && hallsFile.halls ? hallsFile.halls : [];
  console.log("halls             :", importHalls(db, halls), "records");

  // data/exhibits.json
  const exFile = readJSON("exhibits.json");
  const exhibits = exFile && exFile.exhibits ? exFile.exhibits : [];
  console.log("exhibits          :", importExhibits(db, exhibits), "records");

  // data/users.json
  const usersFile = readJSON("users.json");
  const users = usersFile && usersFile.users ? usersFile.users : [];
  console.log("users             :", importUsers(db, users), "records");

  // Contact messages preserved across imports
  const msgCount = db.prepare("SELECT COUNT(*) AS c FROM contact_messages").get().c;
  console.log("contact_messages  :", msgCount, "records (preserved)");

  console.log("----------------------------------------------");
  console.log("Database ready   :", DB_PATH);

  db.close();
  return { dbPath: DB_PATH, counts: { civs, halls, exhibits, users } };
}

// Allow both direct execution (node database/init.js) and require()
if (require.main === module) {
  try {
    init();
  } catch (err) {
    console.error("[init] FAILED:", err);
    process.exit(1);
  }
}

module.exports = { init, DB_PATH, parseArray };

