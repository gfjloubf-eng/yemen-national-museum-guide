/**
 * process.js
 * Organizes the source images from the صور folder:
 *  - Creates structured destination folders under assets/images/photos/
 *  - Copies + renames originals (sequential, semantic names)
 *  - Converts to optimized WebP (full + thumbnail)
 *  - Detects duplicates via SHA-256
 *  - Generates image-manifest.json
 *  - Generates a Markdown report
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "صور");
const DEST = path.join(ROOT, "assets", "images", "photos");
const ORIG_DIR = path.join(DEST, "originals");
const MANIFEST_PATH = path.join(ROOT, "image-manifest.json");
const REPORT_PATH = path.join(ROOT, "reports", "image_organization_report.md");

const MAX_DIM = 1600;   // max dimension for optimized WebP
const QUALITY = 82;     // webp quality full
const THUMB_MAX = 400;  // thumbnail max dimension
const THUMB_QUALITY = 75;

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function pad(n, w) {
  return String(n).padStart(w, "0");
}

function fmtBytes(n) {
  if (n == null) return "-";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

function listJfif(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => /\.jfif$/i.test(f)).sort();
}

function fileSize(p) {
  try {
    return fs.statSync(p).size;
  } catch (e) {
    return null;
  }
}

async function main() {
  const files = listJfif(SRC);
  if (files.length === 0) {
    console.log("NO_SOURCE_FILES");
    return;
  }

  // Prepare destination folders
  fs.mkdirSync(ORIG_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });

  const width = String(files.length).length;
  const manifest = {
    $schema: "image-manifest-schema-v1",
    generatedAt: new Date().toISOString(),
    sourceDir: "صور",
    destination: "assets/images/photos/",
    totalFiles: files.length,
    conversion: {
      format: "webp",
      maxDimension: MAX_DIM,
      quality: QUALITY,
      thumbnailMaxDimension: THUMB_MAX,
      thumbnailQuality: THUMB_QUALITY,
    },
    images: [],
  };

  const dupGroups = {}; // sha256 -> [{id, srcName, rel}]
  const rows = [];
  let totalOrig = 0;
  let totalWebp = 0;
  let totalThumb = 0;

  for (let i = 0; i < files.length; i++) {
    const srcName = files[i];
    const id = pad(i + 1, width);
    const srcPath = path.join(SRC, srcName);

    // 1. Hash (duplicate detection)
    const hash = sha256(srcPath);
    if (!dupGroups[hash]) dupGroups[hash] = [];
    dupGroups[hash].push({ id, srcName });

    // 2. Copy original (renamed)
    const origName = `photo-${id}${path.extname(srcName).toLowerCase()}`;
    const origPath = path.join(ORIG_DIR, origName);
    fs.copyFileSync(srcPath, origPath);

    // 3. Convert to optimized WebP
    const webpName = `photo-${id}.webp`;
    const webpPath = path.join(DEST, webpName);
    await sharp(srcPath)
      .rotate()
      .resize({
        width: MAX_DIM,
        height: MAX_DIM,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(webpPath);

    // 4. Thumbnail WebP
    const thumbName = `thumb-${id}.webp`;
    const thumbPath = path.join(DEST, thumbName);
    await sharp(srcPath)
      .rotate()
      .resize({
        width: THUMB_MAX,
        height: THUMB_MAX,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: THUMB_QUALITY, effort: 4 })
      .toFile(thumbPath);

    // 5. Dimensions (post-resize)
    const meta = await sharp(webpPath).metadata();
    const origDim = await sharp(srcPath).metadata();
    const oSize = fileSize(srcPath);
    const wSize = fileSize(webpPath);
    const tSize = fileSize(thumbPath);
    const savings = oSize && wSize ? Math.round((1 - wSize / oSize) * 100) : null;

    totalOrig += oSize || 0;
    totalWebp += wSize || 0;
    totalThumb += tSize || 0;

    const item = {
      id,
      originalName: srcName,
      renamedOriginal: origName,
      webp: `assets/images/photos/${webpName}`,
      thumbnail: `assets/images/photos/${thumbName}`,
      originalRelPath: `صور/${srcName}`,
      archivedOriginal: `assets/images/photos/originals/${origName}`,
      originalSizeBytes: oSize,
      originalSizeHuman: fmtBytes(oSize),
      webpSizeBytes: wSize,
      webpSizeHuman: fmtBytes(wSize),
      thumbnailSizeBytes: tSize,
      thumbnailSizeHuman: fmtBytes(tSize),
      savingsPercent: savings,
      originalDimensions: origDim && origDim.width ? `${origDim.width}x${origDim.height}` : null,
      webpDimensions: meta && meta.width ? `${meta.width}x${meta.height}` : null,
      format: "webp",
      sha256: hash,
      mtime: fs.statSync(srcPath).mtime.toISOString(),
    };
    manifest.images.push(item);

    rows.push(`| ${item.id} | ${item.originalName.slice(0, 24)}… | ${item.originalDimensions} | ${item.webpDimensions} | ${fmtBytes(oSize)} | ${fmtBytes(wSize)} | ${savings == null ? "-" : savings + "%"} | ${fmtBytes(tSize)} |`);

    console.log("PROCESSED " + id + " " + srcName.slice(0, 20) + " -> " + webpName);
  }

  // Duplicate analysis
  const duplicateGroups = Object.values(dupGroups).filter((g) => g.length > 1);
  manifest.duplicates = {
    exact: duplicateGroups.length,
    totalDuplicatedFiles: duplicateGroups.reduce((s, g) => s + g.length - 1, 0),
    groups: duplicateGroups.map((g) => ({
      sha256: Object.keys(dupGroups).find((k) => dupGroups[k] === g),
      items: g,
    })),
  };

  // Sorting the final manifest by id (already sequential)
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log("MANIFEST_WRITTEN " + MANIFEST_PATH);

  // ---------- REPORT ----------
  const dupLines =
    duplicateGroups.length === 0
      ? "- No exact duplicate files detected (all SHA-256 hashes are unique)."
      : duplicateGroups.map(
          (g) => `- ${g.length} files share hash: ${g.map((x) => x.srcName).join(", ")}`
        ).join("\n");

  const md = `# Image Organization Report

**Generated:** ${manifest.generatedAt}

## Summary

| Metric | Value |
|--------|-------|
| Source folder | \`صور\` |
| Files organized | ${files.length} |
| Original total size | ${fmtBytes(totalOrig)} |
| Optimized WebP total size | ${fmtBytes(totalWebp)} |
| Thumbnails total size | ${fmtBytes(totalThumb)} |
| Total size saved | ${fmtBytes(totalOrig - totalWebp)} (${Math.round(((totalOrig - totalWebp) / totalOrig) * 100)}%) |
| Duplicate groups | ${manifest.duplicates.exact} |

## Output Structure

\`\`\`
assets/images/photos/
├── originals/          # archived original .jfif (renamed)
│   ├── photo-001.jfif
│   └── …
├── photo-001.webp      # optimized WebP (max ${MAX_DIM}px, q${QUALITY})
├── thumb-001.webp      # thumbnail WebP (max ${THUMB_MAX}px, q${THUMB_QUALITY})
└── …
\`\`\`

## Sources (${files.length})

All files are JPEG-encoded images with the extension \`.jfif\`, 24-bit RGB (no alpha channel).

| # | Source | Size | Original Dims | WebP Dims | Weight | Original | WebP | Saved | Thumb |
|---|--------|------|--------------|-----------|--------|----------|------|-------|-------|
${rows.join("\n")}

## Duplicate Detection

${dupLines}

## Notes

- Originals were **copied** (not deleted) into \`assets/images/photos/originals/\` to preserve the source data; the \`صور\` folder is left untouched.
- Renaming follows the pattern \`photo-NNN.webp\` / \`thumb-NNN.webp\` with ordering based on alphabetical filename sort.
- Full mapping of original ⟶ new names is stored in \`image-manifest.json\`.
- EXIF orientation was applied automatically during conversion.
- No near-duplicate detection was performed; only exact (SHA-256) duplicates.
`;

  fs.writeFileSync(REPORT_PATH, md, "utf8");
  console.log("REPORT_WRITTEN " + REPORT_PATH);
  console.log("DONE total_orig=" + totalOrig + " total_webp=" + totalWebp);
}

main().catch((e) => {
  console.error("ERROR", e);
  process.exit(1);
});

