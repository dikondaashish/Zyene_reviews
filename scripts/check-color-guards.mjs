import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP_SEGMENTS = [
  `${path.sep}resend${path.sep}templates${path.sep}`,
];

const SKIP_BASENAMES = new Set([
  "qr-code-card.tsx",
  "report-generator.tsx",
  "layout.tsx",
  "public-profile-editor.tsx",
  "send-competitor-alert-email.ts",
  "generate-qr.ts",
  "review-page-background.ts",
  "opengraph-image.tsx",
  "transactional-email-styles.ts",
]);

const TAILWIND_PALETTE_RE =
  /\b(?:bg|text|border|from|to|via|ring|stroke|fill)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}\b/g;

const HEX_RE = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

function isSkipped(filePath) {
  if (SKIP_BASENAMES.has(path.basename(filePath))) return true;
  return SKIP_SEGMENTS.some((segment) => filePath.includes(segment));
}

function collectFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (new Set([".git", "node_modules", ".next", "dist", "build", ".cursor", ".agent"]).has(entry.name)) {
        continue;
      }
      collectFiles(fullPath, acc);
      continue;
    }
    if (entry.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function shouldIgnoreHexMatch(line, index) {
  const before = line.slice(Math.max(0, index - 10), index);
  const after = line.slice(index);

  // Ignore anchor/id-ish fragments like href="#features" or "#2026-04"
  if (/href\s*=\s*["']$/.test(before)) return true;
  if (/^#[0-9]+-/.test(after)) return true;

  // Ignore HTML numeric entities like &#125; or &#123;
  if (line[index - 1] === "&") return true;

  return false;
}

function scanFile(filePath) {
  const rel = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const hits = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    for (const match of line.matchAll(TAILWIND_PALETTE_RE)) {
      hits.push({
        type: "tailwind-palette",
        token: match[0],
        line: i + 1,
      });
    }

    for (const match of line.matchAll(HEX_RE)) {
      if (shouldIgnoreHexMatch(line, match.index ?? 0)) continue;
      hits.push({
        type: "raw-hex",
        token: match[0],
        line: i + 1,
      });
    }
  }

  return { rel, hits };
}

const allFiles = collectFiles(ROOT).filter((f) => !isSkipped(f));
const violations = allFiles.map(scanFile).filter((r) => r.hits.length > 0);

if (violations.length === 0) {
  console.log("OK: no raw hex colors or Tailwind palette utilities found.");
  process.exit(0);
}

console.error("Color guard failed. Found forbidden color usage:\n");
for (const file of violations) {
  console.error(`${file.rel}`);
  for (const hit of file.hits) {
    console.error(`  L${hit.line}  ${hit.type}  ${hit.token}`);
  }
  console.error("");
}

console.error(
  "Use semantic tokens/classes instead. Skipped: resend/templates, qr-code-card.tsx, report-generator.tsx, layout.tsx, public-profile-editor.tsx, send-competitor-alert-email.ts, generate-qr.ts, review-page-background.ts, opengraph-image.tsx, transactional-email-styles.ts."
);
process.exit(1);
