/**
 * scan.js
 * Scans the source images folder (صور) and produces a JSON catalog
 * with file name, size, sha256, extension, and sharp metadata
 * (dimensions, format, hasAlpha).
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "صور");
const OUT = path.join(__dirname, "scan_report.json");

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

let sharp = null;
try {
  sharp = require("sharp");
} catch (e) {
  sharp = null;
}

function listImages(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listImages(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

async function getMeta(f) {
  if (!sharp) return { dims: null, format: null, hasAlpha: null };
  try {
    const meta = await sharp(f).metadata();
    return {
      dims: meta && meta.width && meta.height ? `${meta.width}x${meta.height}` : null,
      format: meta ? meta.format : null,
      hasAlpha: meta ? meta.hasAlpha : null,
      orientation: meta ? meta.orientation : null,
      pages: meta ? meta.pages : null,
    };
  } catch (e) {
    return { dims: null, format: null, hasAlpha: null, readError: String(e.message || e).slice(0, 200) };
  }
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.log("SRC_NOT_FOUND " + SRC);
    fs.writeFileSync(OUT, JSON.stringify({ error: "src not found", src: SRC }, null, 2));
    return;
  }

  const files = listImages(SRC);
  const images = [];

  for (const f of files) {
    const rel = path.relative(ROOT, f).split(path.sep).join("/");
    const stat = fs.statSync(f);
    const ext = path.extname(f).toLowerCase();
    const meta = await getMeta(f);
    images.push({
      rel,
      name: path.basename(f),
      ext,
      size: stat.size,
      mtime: stat.mtime.toISOString(),
      sha256: sha256(f),
      ...meta,
    });
  }

  images.sort((a, b) => a.name.localeCompare(b.name));

  const report = {
    generatedAt: new Date().toISOString(),
    sourceDir: "صور",
    sharpAvailable: !!sharp,
    imageCount: images.length,
    totalBytes: images.reduce((s, i) => s + i.size, 0),
    extensions: images.reduce((acc, i) => {
      acc[i.ext] = (acc[i.ext] || 0) + 1;
      return acc;
    }, {}),
    images,
  };

  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log("SCAN_DONE count=" + report.imageCount + " sharp=" + !!sharp);
  console.log("OUT=" + OUT);
}

main();

