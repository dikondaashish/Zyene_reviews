/**
 * Phase 3: slim page.tsx to <=100 lines via page-client.tsx or page-view.tsx
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const MAX_LINES = 100;

const KEEP_EXPORT_PREFIXES = [
  "export const metadata",
  "export const dynamic",
  "export async function generateMetadata",
  "export function generateMetadata",
  "export async function generateStaticParams",
  "export function generateStaticParams",
];

function listPages() {
  const pages = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name === "page.tsx") pages.push(p);
    }
  }
  walk(path.join(ROOT, "src/app"));
  return pages;
}

function countLines(filePath) {
  return fs.readFileSync(filePath, "utf8").split("\n").length;
}

function isClientPage(content) {
  return /^\s*["']use client["'];?\s*$/m.test(content.split("\n").slice(0, 3).join("\n"));
}

function extractExportBlock(lines, startIdx) {
  let depth = 0;
  let started = false;
  let i = startIdx;
  for (; i < lines.length; i++) {
    const l = lines[i];
    for (const ch of l) {
      if (ch === "{" || ch === "(" || ch === "[") {
        depth++;
        started = true;
      }
      if (ch === "}" || ch === ")" || ch === "]") depth--;
    }
    const t = l.trim();
    if (t.endsWith(";") && (!started || depth <= 0)) {
      return { block: lines.slice(startIdx, i + 1).join("\n"), end: i + 1 };
    }
    if (/^}\s*;?\s*$/.test(t) && started && depth <= 0 && i > startIdx) {
      return { block: lines.slice(startIdx, i + 1).join("\n"), end: i + 1 };
    }
  }
  return { block: lines.slice(startIdx).join("\n"), end: lines.length };
}

function findKeptExportBlocks(content) {
  const lines = content.split("\n");
  const blocks = [];
  const ranges = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (KEEP_EXPORT_PREFIXES.some((p) => trimmed.startsWith(p))) {
      const { block, end } = extractExportBlock(lines, i);
      blocks.push(block);
      ranges.push([i, end]);
      i = end - 1;
    }
  }
  return { blocks, ranges };
}

function removeRanges(lines, ranges) {
  const remove = new Set();
  for (const [start, end] of ranges) {
    for (let i = start; i < end; i++) remove.add(i);
  }
  return lines.filter((_, i) => !remove.has(i)).join("\n").trim();
}

function splitClientPage(pagePath, content) {
  const dir = path.dirname(pagePath);
  const clientPath = path.join(dir, "page-client.tsx");
  if (fs.existsSync(clientPath)) return false;
  fs.writeFileSync(clientPath, content);
  const defaultMatch = content.match(/export default function (\w+)/);
  const name = defaultMatch?.[1] ?? "PageClient";
  fs.writeFileSync(
    pagePath,
    `import ${name} from "./page-client";

export default ${name};
`,
  );
  return true;
}

function collectImportLines(lines, ranges) {
  const remove = new Set();
  for (const [start, end] of ranges) {
    for (let i = start; i < end; i++) remove.add(i);
  }
  const keptBody = lines
    .filter((_, i) => !remove.has(i))
    .join("\n");
  const importLines = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("import ")) continue;
    if (importLines.includes(line)) continue;
    const symbols = [
      ...[...keptBody.matchAll(/\b([A-Z][A-Za-z0-9_]*)\b/g)].map((m) => m[1]),
    ];
    const used =
      symbols.some((sym) => line.includes(sym)) ||
      (line.includes("Metadata") && /Metadata/.test(keptBody));
    if (used) importLines.push(line);
  }
  return importLines;
}

function splitServerPage(pagePath, content) {
  const dir = path.dirname(pagePath);
  const viewPath = path.join(dir, "page-view.tsx");
  if (fs.existsSync(viewPath)) return false;

  const { blocks, ranges } = findKeptExportBlocks(content);
  const lines = content.split("\n");
  const body = removeRanges(lines, ranges);
  const pageImports = collectImportLines(lines, ranges);

  if (!body.includes("export default")) return false;

  fs.writeFileSync(viewPath, body + "\n");

  const kept = blocks.join("\n\n");
  const importBlock = pageImports.length ? pageImports.join("\n") + "\n\n" : "";
  const thin = `${importBlock}${kept ? kept + "\n\n" : ""}import PageView from "./page-view";

export default PageView;
`;
  fs.writeFileSync(pagePath, thin);
  return true;
}

const pages = listPages().filter((p) => countLines(p) > MAX_LINES);
let split = 0;
for (const pagePath of pages) {
  const before = countLines(pagePath);
  const rel = path.relative(ROOT, pagePath);
  const content = fs.readFileSync(pagePath, "utf8");
  const ok = isClientPage(content)
    ? splitClientPage(pagePath, content)
    : splitServerPage(pagePath, content);
  if (ok) {
    const after = countLines(pagePath);
    console.log(`${rel}: ${before} -> ${after} lines`);
    split++;
  } else {
    console.log(`SKIP ${rel}`);
  }
}

const stillOver = listPages().filter((p) => countLines(p) > MAX_LINES);
console.log(`Split ${split} pages. Still over ${MAX_LINES} lines: ${stillOver.length}`);
for (const p of stillOver.slice(0, 15)) {
  console.log(`  ${countLines(p)} ${path.relative(ROOT, p)}`);
}
