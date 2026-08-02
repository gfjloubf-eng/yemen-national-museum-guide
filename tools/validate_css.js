/* Validate CSS brace balance + HTML page CSS references + JSON data files */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
let allOk = true;

// 1) CSS brace balance
const cssFiles = [
  "css/style.css",
  "css/responsive.css",
  "css/dashboard.css",
  "css/animations.css"
];

console.log("=== CSS brace balance ===");
for (const f of cssFiles) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) {
    console.log(`MISSING: ${f}`);
    allOk = false;
    continue;
  }
  const css = fs.readFileSync(full, "utf8");
  const open = (css.match(/{/g) || []).length;
  const close = (css.match(/}/g) || []).length;
  const ok = open === close;
  if (!ok) allOk = false;
  console.log(`${f}: { ${open} | } ${close} => ${ok ? "OK" : "MISMATCH"}`);
}

// 2) HTML pages reference core CSS
console.log("\n=== HTML page CSS references (root) ===");
const htmlPages = fs.readdirSync(root).filter((x) => x.endsWith(".html"));
for (const h of htmlPages) {
  const content = fs.readFileSync(path.join(root, h), "utf8");
  const hasStyle = content.includes("css/style.css");
  const hasResponsive = content.includes("css/responsive.css");
  const hasAnim = content.includes("css/animations.css");
  console.log(`${h}: style=${hasStyle} responsive=${hasResponsive} animations=${hasAnim}`);
}

// 2b) Legacy pages/ folder
console.log("\n=== HTML page CSS references (pages/) ===");
const pagesDir = path.join(root, "pages");
if (fs.existsSync(pagesDir)) {
  const legacy = fs.readdirSync(pagesDir).filter((x) => x.endsWith(".html"));
  for (const h of legacy) {
    const content = fs.readFileSync(path.join(pagesDir, h), "utf8");
    const hasStyle = content.includes("../css/style.css");
    const hasResponsive = content.includes("../css/responsive.css");
    const hasAnim = content.includes("../css/animations.css");
    console.log(`${h}: style=${hasStyle} responsive=${hasResponsive} animations=${hasAnim}`);
  }
}

// 3) JSON data files valid
console.log("\n=== JSON data files ===");
const jsonFiles = [
  "data/museum.json",
  "data/civilizations.json",
  "data/exhibits.json",
  "data/halls.json",
  "data/users.json"
];
for (const f of jsonFiles) {
  const full = path.join(root, f);
  try {
    const d = JSON.parse(fs.readFileSync(full, "utf8"));
    console.log(`${f}: valid JSON, top-level keys: ${Object.keys(d).join(",")}`);
  } catch (e) {
    console.log(`${f}: INVALID — ${e.message}`);
    allOk = false;
  }
}

process.exit(allOk ? 0 : 1);

