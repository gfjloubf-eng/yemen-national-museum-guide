-- ============================================================
-- YEMEN NATIONAL MUSEUM GUIDE — database/schema.sql
-- SQLite schema for the museum digital guide backend
-- Engineer: Eng. Ammar Adel Al-Masouei
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Central museum object (meta, stats, news, map, provinceImages, home)
CREATE TABLE IF NOT EXISTS museum_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT NOT NULL
);

-- Civilizations (from data/civilizations.json)
CREATE TABLE IF NOT EXISTS civilizations (
  id TEXT PRIMARY KEY,
  name TEXT,
  nameEn TEXT,
  era TEXT,
  capital TEXT,
  province TEXT,
  icon TEXT,
  description TEXT,
  history TEXT,
  keySites TEXT,
  artifactsCount INTEGER DEFAULT 0,
  image TEXT,
  hallId TEXT,
  achievements TEXT,
  thumbnail TEXT,
  banner TEXT,
  heroImage TEXT,
  backgroundImage TEXT,
  imageAlt TEXT,
  imageCaption TEXT,
  imageCredit TEXT
);

-- Categories (from data/museum.json)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT,
  nameEn TEXT,
  icon TEXT
);

-- Yemeni provinces (from data/museum.json)
CREATE TABLE IF NOT EXISTS provinces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
);

-- Floors (from data/museum.json)
CREATE TABLE IF NOT EXISTS floors (
  id INTEGER PRIMARY KEY,
  name TEXT,
  nameEn TEXT,
  theme TEXT,
  themeEn TEXT,
  description TEXT,
  icon TEXT,
  halls TEXT,
  image TEXT,
  thumbnail TEXT,
  background TEXT,
  heroImage TEXT
);

-- Halls (from data/halls.json)
CREATE TABLE IF NOT EXISTS halls (
  id TEXT PRIMARY KEY,
  number INTEGER,
  name TEXT,
  nameEn TEXT,
  floor INTEGER,
  civilization TEXT,
  theme TEXT,
  description TEXT,
  size INTEGER,
  capacity INTEGER,
  artifacts INTEGER,
  location TEXT,
  features TEXT,
  image TEXT,
  thumbnail TEXT,
  cover TEXT,
  coverAlt TEXT,
  heroImage TEXT,
  backgroundImage TEXT,
  imageCredit TEXT
);

-- Exhibits (from data/exhibits.json)
CREATE TABLE IF NOT EXISTS exhibits (
  id INTEGER PRIMARY KEY,
  name TEXT,
  nameAr TEXT,
  nameEn TEXT,
  description TEXT,
  civilization TEXT,
  civilizationId TEXT,
  era TEXT,
  century TEXT,
  category TEXT,
  categoryId TEXT,
  material TEXT,
  province TEXT,
  discoveryLocation TEXT,
  discoveryDate TEXT,
  floor INTEGER,
  hall TEXT,
  position TEXT,
  image TEXT,
  gallery TEXT,
  model3d TEXT,
  qr TEXT,
  audioGuide TEXT,
  related TEXT,
  featured INTEGER DEFAULT 0,
  date TEXT,
  thumbnail TEXT,
  heroImage TEXT,
  backgroundImage TEXT,
  alt TEXT,
  caption TEXT,
  imageCredit TEXT,
  image2 TEXT,
  image3 TEXT
);

-- Historical events (from data/museum.json)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  year TEXT,
  title TEXT,
  description TEXT,
  image TEXT,
  thumbnail TEXT
);

-- Historical figures (from data/museum.json)
CREATE TABLE IF NOT EXISTS figures (
  id TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  civilization TEXT,
  period TEXT,
  description TEXT,
  image TEXT,
  thumbnail TEXT
);

-- Users (from data/users.json) — demo authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  name TEXT,
  nameEn TEXT,
  email TEXT,
  role TEXT,
  avatar TEXT,
  joined TEXT,
  favorites TEXT,
  notes TEXT,
  preferences TEXT,
  permissions TEXT
);

-- Contact messages (submitted via POST /api/contact)
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

