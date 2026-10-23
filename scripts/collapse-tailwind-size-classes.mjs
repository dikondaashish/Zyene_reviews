import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");

function collapseSizesInClassString(str) {
    if (!/\bw-[\w.[\]%+-]+\b/.test(str) || !/\bh-[\w.[\]%+-]+\b/.test(str)) {
        return str;
    }

    const tokens = str.split(/\s+/).filter(Boolean);
    const wSizes = new Set();
    const hSizes = new Set();

    for (const token of tokens) {
        const wMatch = token.match(/^w-(.+)$/);
        const hMatch = token.match(/^h-(.+)$/);
        if (wMatch) wSizes.add(wMatch[1]);
        if (hMatch) hSizes.add(hMatch[1]);
    }

    const common = [...wSizes].filter((size) => hSizes.has(size));
    if (common.length === 0) return str;

    const commonSet = new Set(common);
    const out = [];

    for (const token of tokens) {
        const wMatch = token.match(/^w-(.+)$/);
        const hMatch = token.match(/^h-(.+)$/);
        if (wMatch && commonSet.has(wMatch[1])) continue;
        if (hMatch && commonSet.has(hMatch[1])) continue;
        out.push(token);
    }

    for (const size of common) {
        out.push(`size-${size}`);
    }

    return out.join(" ");
}

function processFileContent(content) {
    return content.replace(/(["'`])([^\1]*?)\1/g, (full, quote, inner) => {
        if (!/\bw-[\w.[\]%+-]+\b/.test(inner) || !/\bh-[\w.[\]%+-]+\b/.test(inner)) {
            return full;
        }
        if (inner.length > 2000) return full;
        return `${quote}${collapseSizesInClassString(inner)}${quote}`;
    });
}

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === "tests" || entry.name === "__tests__") continue;
            walk(full, out);
            continue;
        }
        if (!/\.(tsx|ts)$/.test(entry.name)) continue;
        if (/\.test\.(tsx|ts)$/.test(entry.name)) continue;
        if (entry.name === "database.types.ts") continue;
        out.push(full);
    }
    return out;
}

let changedFiles = 0;
for (const file of walk(SRC)) {
    const original = fs.readFileSync(file, "utf8");
    const updated = processFileContent(original);
    if (updated !== original) {
        fs.writeFileSync(file, updated);
        changedFiles += 1;
    }
}

console.log(`Updated ${changedFiles} files`);
