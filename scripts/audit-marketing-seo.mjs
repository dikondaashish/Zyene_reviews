#!/usr/bin/env node
/**
 * One-off marketing on-page SEO audit (read-only). Run: node scripts/audit-marketing-seo.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const MARKETING = join(ROOT, "src/app/(marketing)");
const COMPONENTS = join(ROOT, "src/components/marketing");
const LIB = join(ROOT, "src/lib");

function walk(dir, acc = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, acc);
        else if (name.endsWith(".tsx") || name.endsWith(".ts")) acc.push(p);
    }
    return acc;
}

function extractMetaDescription(content, file) {
    const routes = [];
    // Static metadata.description in page.tsx
    const staticMatch = content.match(
        /export const metadata[^=]*=\s*\{[\s\S]*?description:\s*([\s\S]*?)(?=,\s*\n\s*(?:alternates|openGraph|twitter|keywords|robots|\}))/m
    );
    if (staticMatch) {
        const desc = evalDescription(staticMatch[1]);
        if (desc) routes.push({ file, type: "static", description: desc });
    }
    // generateMetadata return { description: ... }
    const genMatch = content.match(
        /generateMetadata[\s\S]*?return\s*\{[\s\S]*?description:\s*([^,}\n]+(?:\n[^}]*?)?)/m
    );
    if (genMatch && !routes.length) {
        const desc = evalDescription(genMatch[1].split(",")[0]);
        if (desc) routes.push({ file, type: "generateMetadata", description: desc });
    }
    const genBlock = content.match(/description:\s*([a-zA-Z.[\]()]+(?:\.[a-zA-Z]+)?)/g);
    return routes;
}

function evalDescription(raw) {
    if (!raw) return null;
    let s = raw.trim();
    if (s.startsWith("post.") || s.startsWith("data.") || s.startsWith("study.") || s.startsWith("resource.") || s.startsWith("article.")) {
        return { dynamic: s, length: null };
    }
    if (s.startsWith("cat.")) return { dynamic: s, length: null };
    // String literal
    const m = raw.match(/["'`]((?:\\.|[^"'`])*)["'`]/s) || raw.match(/["'`]([^"'`]+)["'`]/);
    if (m) return { dynamic: false, length: m[1].length, text: m[1].replace(/\\n/g, " ") };
    return { dynamic: true, raw: s.slice(0, 80) };
}

function countH1InFile(content) {
    const h1s = [...content.matchAll(/<h1[\s>]/g)];
    const h1Text = [...content.matchAll(/<h1[^>]*>([^<]+)</g)].map((m) => m[1].trim());
    return { count: h1s.length, texts: h1Text };
}

function analyzeHeadingHierarchy(content) {
    const levels = [...content.matchAll(/<h([1-6])[\s>]/g)].map((m) => parseInt(m[1], 10));
    const skips = [];
    for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
            skips.push({ from: levels[i - 1], to: levels[i], index: i });
        }
    }
    return { levels, skips };
}

function findImages(content, file) {
    const issues = [];
    const imgTags = [...content.matchAll(/<Image[\s\S]*?\/?>/g)];
    for (const m of imgTags) {
        const tag = m[0];
        const altMatch = tag.match(/alt=\{?["'`]([^"'`]*)["'`]\}?/) || tag.match(/alt=\{([^}]+)\}/);
        const alt = altMatch ? altMatch[1] : null;
        if (!altMatch) issues.push({ file, issue: "missing alt", snippet: tag.slice(0, 80) });
        else if (!alt || alt.trim() === "") issues.push({ file, issue: "empty alt", snippet: tag.slice(0, 80) });
        else if (/^(image|photo|picture|img|logo|icon)$/i.test(alt.trim()))
            issues.push({ file, issue: `generic alt: "${alt}"`, snippet: tag.slice(0, 80) });
    }
    return issues;
}

function extractInternalLinks(content) {
    const links = new Set();
    const patterns = [
        /href=\{?["'`](\/[^"'`#?][^"'`]*)["'`]\}?/g,
        /href:\s*["'`](\/[^"'`#?][^"'`]*)["'`]/g,
    ];
    for (const re of patterns) {
        for (const m of content.matchAll(re)) {
            let path = m[1].split("#")[0].split("?")[0];
            if (!path.endsWith("/") && !path.includes(".")) path += "";
            links.add(path);
        }
    }
    return links;
}

function wordCountFromStrings(strings) {
    return strings.join(" ").split(/\s+/).filter(Boolean).length;
}

// --- Main ---
const pageFiles = walk(MARKETING).filter((f) => f.endsWith("page.tsx"));
const marketingFiles = [...walk(MARKETING), ...walk(COMPONENTS)];

console.log(JSON.stringify({ pageCount: pageFiles.length }, null, 2));

const metaResults = [];
for (const file of pageFiles) {
    const content = readFileSync(file, "utf8");
    const rel = relative(ROOT, file);
    let description = null;
    let dynamic = false;

    if (content.includes("generateMetadata")) {
        const dm = content.match(/description:\s*([a-zA-Z0-9_.[\]()]+)/);
        if (dm) {
            const ref = dm[1].replace(/,.*$/, "");
            if (ref.includes("metaDescription") || ref.includes("excerpt") || ref.includes("description")) {
                dynamic = ref;
            }
        }
    }

    const descLiteral = content.match(/^\s*description:\s*\n?\s*["'`]([^"'`]+)["'`]/m) ||
        content.match(/description:\s*["'`]([^"'`]+)["'`]/);
    if (descLiteral) {
        description = descLiteral[1];
    } else if (content.match(/description:\s*\n\s*["']/)) {
        const multi = content.match(/description:\s*\n\s*["'`]([^"'`]+)["'`]/s);
        if (multi) description = multi[1].replace(/\s+/g, " ");
    }

    if (!description && !dynamic && !content.includes("generateMetadata")) {
        metaResults.push({ route: rel, issue: "no description found" });
    } else if (description) {
        const len = description.length;
        metaResults.push({
            route: rel,
            description,
            length: len,
            ok: len >= 120 && len <= 160,
            short: len < 120,
            long: len > 160,
        });
    } else {
        metaResults.push({ route: rel, dynamic: dynamic || "generateMetadata/data-driven" });
    }
}

// Resolve dynamic descriptions from data files
const blogPosts = readFileSync(join(LIB, "phase4/blog-posts-month1.ts"), "utf8");
// ... simplified - grep metaDescription from all data

const h1ByPageView = {};
for (const file of marketingFiles) {
    const rel = relative(ROOT, file);
    if (!rel.includes("(marketing)")) continue;
    const content = readFileSync(file, "utf8");
    const { count, texts } = countH1InFile(content);
    if (count > 0) h1ByPageView[rel] = { count, texts };
}

const imageIssues = [];
for (const file of marketingFiles) {
    imageIssues.push(...findImages(readFileSync(file, "utf8"), relative(ROOT, file)));
}

const allLinks = new Set();
for (const file of [...walk(MARKETING), join(ROOT, "src/app/(marketing)/marketing-layout-header.tsx"), join(ROOT, "src/app/(marketing)/marketing-layout-footer.tsx")].filter((f) => {
    try { return statSync(f).isFile(); } catch { return false; }
})) {
    if (!f.endsWith(".tsx")) continue;
    for (const l of extractInternalLinks(readFileSync(f, "utf8"))) allLinks.add(l);
}

console.log("META", JSON.stringify(metaResults, null, 2));
console.log("H1", JSON.stringify(h1ByPageView, null, 2));
console.log("IMAGES", JSON.stringify(imageIssues.slice(0, 50), null, 2));
console.log("LINKS_COUNT", allLinks.size);
