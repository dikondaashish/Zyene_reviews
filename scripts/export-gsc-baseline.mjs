#!/usr/bin/env node
/**
 * Export Google Search Console baseline (last 28 complete days, excluding today).
 *
 * Auth: GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
 * Property: GSC_SITE_URL (default https://www.zyenereviews.com/)
 *
 * Usage: pnpm geo:gsc-baseline
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { google } from "googleapis";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "reports", "gsc");
const SITE_URL = (process.env.GSC_SITE_URL ?? "https://www.zyenereviews.com/").trim();
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

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

function ymd(d) {
    return d.toISOString().slice(0, 10);
}

function last28CompleteDays() {
    const end = new Date();
    end.setUTCHours(12, 0, 0, 0);
    end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 27);
    return { startDate: ymd(start), endDate: ymd(end) };
}

function resolveCredentials() {
    const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
    if (b64) {
        try {
            return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
        } catch {
            throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not valid base64 JSON");
        }
    }
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    if (!path) {
        throw new Error(
            "Missing credentials: set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path, or GOOGLE_SERVICE_ACCOUNT_JSON_BASE64",
        );
    }
    if (!existsSync(path)) {
        throw new Error(`Credential file not found: ${path}`);
    }
    return JSON.parse(readFileSync(path, "utf8"));
}

function mapRow(row, dimensions) {
    const keys = row.keys ?? [];
    const out = {
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
    };
    dimensions.forEach((dim, i) => {
        out[dim] = keys[i] ?? "";
    });
    return out;
}

async function querySearchAnalytics(searchconsole, { startDate, endDate, dimensions, rowLimit }) {
    const res = await searchconsole.searchanalytics.query({
        siteUrl: SITE_URL,
        requestBody: {
            startDate,
            endDate,
            dimensions,
            rowLimit,
            dataState: "final",
        },
    });
    return (res.data.rows ?? []).map((row) => mapRow(row, dimensions));
}

function csvEscape(value) {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function toCsv(rows, columns) {
    const header = columns.join(",");
    const lines = rows.map((row) => columns.map((c) => csvEscape(row[c])).join(","));
    return [header, ...lines].join("\n") + "\n";
}

function explainApiError(err) {
    const status = err?.response?.status ?? err?.code;
    const msg = err?.response?.data?.error?.message ?? err?.message ?? String(err);
    const reasons = (err?.response?.data?.error?.errors ?? [])
        .map((e) => e.reason)
        .filter(Boolean)
        .join(", ");
    const parts = [`HTTP/status: ${status ?? "unknown"}`, `message: ${msg}`];
    if (reasons) parts.push(`reasons: ${reasons}`);
    if (status === 403 || /permission|forbidden/i.test(msg)) {
        parts.push(
            "hint: Add the service account email as a user on this Search Console property (Settings → Users and permissions).",
        );
    }
    if (/has not been used|disabled|API has not been enabled/i.test(msg)) {
        parts.push("hint: Enable the Google Search Console API in Google Cloud Console for project zyene-reviews.");
    }
    if (/not found|invalid.*site/i.test(msg)) {
        parts.push(`hint: Confirm property URL in Search Console matches GSC_SITE_URL (${SITE_URL}).`);
    }
    return parts.join("\n");
}

function writeSummary({ startDate, endDate, queries, pages, queryPages, exportedAt }) {
    const lines = [
        "# GSC baseline summary",
        "",
        `**Exported:** ${exportedAt}`,
        `**Property:** \`${SITE_URL}\``,
        `**Date range:** ${startDate} → ${endDate} (28 complete days, excluding today)`,
        "",
        "| Export | Rows |",
        "|--------|------|",
        `| Top queries | ${queries.length} |`,
        `| Top pages | ${pages.length} |`,
        `| Query × page | ${queryPages.length} |`,
        "",
        "## Files",
        "",
        "- `gsc-baseline-latest.json` — full payload",
        "- `gsc-top-queries-latest.csv`",
        "- `gsc-top-pages-latest.csv`",
        "- `gsc-query-page-latest.csv`",
        "",
        "## Top 10 queries (clicks)",
        "",
        "| Query | Clicks | Impressions | CTR | Position |",
        "|-------|--------|-------------|-----|----------|",
    ];
    for (const row of [...queries].sort((a, b) => b.clicks - a.clicks).slice(0, 10)) {
        lines.push(
            `| ${row.query.replace(/\|/g, "\\|")} | ${row.clicks} | ${row.impressions} | ${(row.ctr * 100).toFixed(2)}% | ${row.position.toFixed(1)} |`,
        );
    }
    lines.push("", "## Manual follow-up", "", "- AI citation queries remain in [GEO_BASELINE_AUDIT.md](../../docs/GEO_BASELINE_AUDIT.md).", "");
    return lines.join("\n");
}

async function main() {
    loadEnvLocal();
    const { startDate, endDate } = last28CompleteDays();
    const exportedAt = new Date().toISOString();

    let credentials;
    try {
        credentials = resolveCredentials();
    } catch (e) {
        console.error("GSC export failed (credentials):", e.message);
        process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({ credentials, scopes: [SCOPE] });
    const searchconsole = google.searchconsole({ version: "v1", auth });

    console.log(`GSC baseline export for ${SITE_URL}`);
    console.log(`Date range: ${startDate} → ${endDate}`);

    let queries;
    let pages;
    let queryPages;
    try {
        [queries, pages, queryPages] = await Promise.all([
            querySearchAnalytics(searchconsole, {
                startDate,
                endDate,
                dimensions: ["query"],
                rowLimit: 50,
            }),
            querySearchAnalytics(searchconsole, {
                startDate,
                endDate,
                dimensions: ["page"],
                rowLimit: 50,
            }),
            querySearchAnalytics(searchconsole, {
                startDate,
                endDate,
                dimensions: ["query", "page"],
                rowLimit: 100,
            }),
        ]);
    } catch (err) {
        console.error("GSC export failed (API):");
        console.error(explainApiError(err));
        process.exit(1);
    }

    if (queries.length === 0 && pages.length === 0) {
        console.warn(
            "Warning: API returned zero rows. Property may have no data yet, wrong site URL, or date range has no impressions.",
        );
    }

    mkdirSync(OUT_DIR, { recursive: true });

    const payload = {
        exportedAt,
        siteUrl: SITE_URL,
        startDate,
        endDate,
        queries,
        pages,
        queryPages,
    };

    writeFileSync(join(OUT_DIR, "gsc-baseline-latest.json"), JSON.stringify(payload, null, 2) + "\n");
    writeFileSync(
        join(OUT_DIR, "gsc-top-queries-latest.csv"),
        toCsv(queries, ["query", "clicks", "impressions", "ctr", "position"]),
    );
    writeFileSync(
        join(OUT_DIR, "gsc-top-pages-latest.csv"),
        toCsv(pages, ["page", "clicks", "impressions", "ctr", "position"]),
    );
    writeFileSync(
        join(OUT_DIR, "gsc-query-page-latest.csv"),
        toCsv(queryPages, ["query", "page", "clicks", "impressions", "ctr", "position"]),
    );
    writeFileSync(
        join(OUT_DIR, "GSC_BASELINE_SUMMARY.md"),
        writeSummary({ startDate, endDate, queries, pages, queryPages, exportedAt }),
    );

    console.log("GSC API connected.");
    console.log(`Queries exported: ${queries.length}`);
    console.log(`Pages exported: ${pages.length}`);
    console.log(`Query-page pairs exported: ${queryPages.length}`);
    console.log(`Output: ${OUT_DIR}`);
}

main().catch((err) => {
    console.error("GSC export failed:", err?.message ?? err);
    process.exit(1);
});
