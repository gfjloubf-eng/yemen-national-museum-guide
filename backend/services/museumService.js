/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — services/museumService.js
   Business logic: home aggregate, exhibits, search, contact.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

const models = require("../models/index");

/* ---------- Home aggregate ---------- */
function getHome() {
  const meta = models.getMuseumMeta() || {};
  const civilizations = models.getCivilizations();
  const exhibits = models.getExhibits();
  const halls = models.getHalls();
  const events = models.getEvents();
  const figures = models.getFigures();
  const categories = models.getCategories();
  const provinces = models.getProvinces();

  return {
    meta: meta.meta || null,
    stats: meta.stats || null,
    floors: meta.floors || [],
    civilizations,
    categories,
    provinces,
    halls,
    exhibits,
    events,
    figures,
    news: meta.news || [],
    map: meta.map || null,
    provinceImages: meta.provinceImages || {},
    home: meta.home || {}
  };
}

/* ---------- Exhibits ---------- */
function getExhibits() {
  return models.getExhibits();
}

function getExhibitById(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  return models.getExhibitById(num);
}

/* ---------- Civilizations ---------- */
function getCivilizations() {
  return models.getCivilizations();
}

/* ---------- Halls ---------- */
function getHalls() {
  return models.getHalls();
}

/* ---------- Floors ---------- */
function getFloors() {
  return models.getFloors();
}

/* ---------- Events ---------- */
function getEvents() {
  return models.getEvents();
}

/* ---------- Figures ---------- */
function getFigures() {
  return models.getFigures();
}

/* ---------- Users (for auth) ---------- */
function getUsers() {
  return models.getUsers().map((u) => {
    const safe = Object.assign({}, u);
    delete safe.password;
    return safe;
  });
}

function login(username, password) {
  const user = models.findUserByCredentials(username, password);
  if (!user) return null;
  const safe = Object.assign({}, user);
  delete safe.password;
  return safe;
}

/* ---------- Search ---------- */
function searchExhibits(query, filters = {}) {
  const q = (query || "").trim().toLowerCase();
  const f = {
    cat: (filters.cat || "").trim(),
    civ: (filters.civ || "").trim(),
    prov: (filters.prov || "").trim(),
    floor: filters.floor !== undefined && filters.floor !== "" ? Number(filters.floor) : null,
    mat: (filters.mat || "").trim()
  };

  let list = models.getExhibits();

  if (f.cat) list = list.filter((x) => x.category === f.cat);
  if (f.civ) list = list.filter((x) => x.civilization === f.civ);
  if (f.prov) list = list.filter((x) => x.province === f.prov);
  if (f.mat) list = list.filter((x) => x.material === f.mat);
  if (f.floor !== null) list = list.filter((x) => x.floor === f.floor);

  if (q) {
    list = list.filter((x) => {
      const haystack = [
        x.nameAr, x.nameEn, x.description, x.civilization, x.province,
        x.century, x.category, x.material, x.discoveryLocation, x.position,
        "الدور " + x.floor
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }

  return list;
}

/* ---------- Contact ---------- */
function submitContact(payload) {
  return models.insertContactMessage(payload);
}

module.exports = {
  getHome,
  getExhibits,
  getExhibitById,
  getCivilizations,
  getHalls,
  getFloors,
  getEvents,
  getFigures,
  getUsers,
  login,
  searchExhibits,
  submitContact
};

