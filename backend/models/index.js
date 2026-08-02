/* ============================================================
   YEMEN NATIONAL MUSEUM GUIDE — models/index.js
   Data-access layer built on better-sqlite3 prepared statements.
   All rows from JSON columns are parsed back into JS values.
   Engineer: Eng. Ammar Adel Al-Masouei
   ============================================================ */
"use strict";

const path = require("path");
const Database = require("better-sqlite3");
const { init, DB_PATH } = require("../database/init");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* ---------- Row mappers ---------- */
function jsonCol(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return raw;
  }
}

function mapExhibit(row) {
  if (!row) return null;
  return {
    ...row,
    gallery: jsonCol(row.gallery),
    related: jsonCol(row.related),
    featured: !!row.featured,
    model3d: jsonCol(row.model3d)
  };
}

function mapHall(row) {
  if (!row) return null;
  return { ...row, features: jsonCol(row.features) };
}

function mapCivilization(row) {
  if (!row) return null;
  return { ...row, keySites: jsonCol(row.keySites), achievements: jsonCol(row.achievements) };
}

function mapFloor(row) {
  if (!row) return null;
  return { ...row, halls: jsonCol(row.halls) };
}

function mapUser(row) {
  if (!row) return null;
  return {
    ...row,
    favorites: jsonCol(row.favorites),
    notes: jsonCol(row.notes),
    preferences: jsonCol(row.preferences),
    permissions: jsonCol(row.permissions)
  };
}

/* ---------- Museum meta ---------- */
function getMuseumMeta() {
  const row = db.prepare("SELECT data FROM museum_meta WHERE id = 1").get();
  return row ? jsonCol(row.data) : null;
}

/* ---------- Civilizations ---------- */
const civStmt = db.prepare("SELECT * FROM civilizations ORDER BY rowid");
function getCivilizations() {
  return civStmt.all().map(mapCivilization);
}

/* ---------- Categories ---------- */
function getCategories() {
  return db.prepare("SELECT * FROM categories ORDER BY rowid").all();
}

/* ---------- Provinces ---------- */
function getProvinces() {
  return db.prepare("SELECT name FROM provinces ORDER BY name").all().map((r) => r.name);
}

/* ---------- Floors ---------- */
function getFloors() {
  return db.prepare("SELECT * FROM floors ORDER BY id").all().map(mapFloor);
}

/* ---------- Halls ---------- */
function getHalls() {
  return db.prepare("SELECT * FROM halls ORDER BY number").all().map(mapHall);
}

/* ---------- Exhibits ---------- */
const exhibitsStmt = db.prepare("SELECT * FROM exhibits ORDER BY id");
const exhibitByIdStmt = db.prepare("SELECT * FROM exhibits WHERE id = ?");
function getExhibits() {
  return exhibitsStmt.all().map(mapExhibit);
}
function getExhibitById(id) {
  return mapExhibit(exhibitByIdStmt.get(id));
}

/* ---------- Events ---------- */
function getEvents() {
  return db.prepare("SELECT * FROM events ORDER BY rowid").all();
}

/* ---------- Figures ---------- */
function getFigures() {
  return db.prepare("SELECT * FROM figures ORDER BY rowid").all();
}

/* ---------- Users ---------- */
function getUsers() {
  return db.prepare("SELECT * FROM users ORDER BY rowid").all().map(mapUser);
}

function findUserByCredentials(username, password) {
  const row = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
  return row ? mapUser(row) : null;
}

/* ---------- Contact messages ---------- */
const insertMessageStmt = db.prepare(`
  INSERT INTO contact_messages (full_name, email, subject, message)
  VALUES (?, ?, ?, ?)
`);
function insertContactMessage({ fullName, email, subject, message }) {
  const info = insertMessageStmt.run(fullName, email, subject, message);
  return info.lastInsertRowid;
}

module.exports = {
  getMuseumMeta,
  getCivilizations,
  getCategories,
  getProvinces,
  getFloors,
  getHalls,
  getExhibits,
  getExhibitById,
  getEvents,
  getFigures,
  getUsers,
  findUserByCredentials,
  insertContactMessage,
  initDb: init
};

