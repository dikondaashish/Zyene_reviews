#!/usr/bin/env node
/**
 * Ping production IndexNow after publishing or updating public URLs.
 *
 * Usage:
 *   pnpm indexnow:ping blog/my-new-post-slug
 *   pnpm indexnow:ping --url https://zyenereviews.com/blog/my-new-post-slug
 *   pnpm indexnow:ping blog/a blog/b resources/google-reviews-guide
 *
 * Requires CRON_SECRET in the environment (same value as Vercel).
 * Loads .env.local automatically when present.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const ROOT = join(import.meta.dirname, "..");
const DEFAULT_BASE = "https://www.zyenereviews.com";
const API_URL = `${DEFAULT_BASE}/api/indexnow`;

function loadEnvLocal() {
    const path = join(ROOT, ".env.local");
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, "utf8").split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
    }
}

function toAbsoluteUrl(input, base) {
    if (input.startsWith("http://") || input.startsWith("https://")) return input;
    const path = input.startsWith("/") ? input : `/${input}`;
    return `${base.replace(/\/$/, "")}${path}`;
}

loadEnvLocal();

const { values, positionals } = parseArgs({
    options: {
        url: { type: "string", multiple: true },
        base: { type: "string", default: DEFAULT_BASE },
    },
    allowPositionals: true,
});

const urls = [
    ...(values.url ?? []),
    ...positionals.map((p) => toAbsoluteUrl(p, values.base)),
];

if (urls.length === 0) {
    console.error(`Usage:
  pnpm indexnow:ping blog/<slug>
  pnpm indexnow:ping --url ${DEFAULT_BASE}/blog/<slug>
  pnpm indexnow:ping blog/slug-a blog/slug-b

Set CRON_SECRET in .env.local (same as Vercel) or export it in your shell.`);
    process.exit(1);
}

const cronSecret = process.env.CRON_SECRET;
if (!cronSecret) {
    console.error("CRON_SECRET is not set. Add it to .env.local or export it before running.");
    process.exit(1);
}

const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
        // Required: middleware CSRF blocks POST without Origin (same as browser).
        Origin: values.base.replace(/\/$/, ""),
    },
    body: JSON.stringify({ urls }),
});

const body = await response.json().catch(() => ({}));

if (!response.ok) {
    console.error(`IndexNow ping failed (${response.status}):`, body.error ?? response.statusText);
    process.exit(1);
}

console.log(`IndexNow ping OK — ${body.count ?? urls.length} URL(s):`);
for (const url of urls) console.log(`  • ${url}`);
