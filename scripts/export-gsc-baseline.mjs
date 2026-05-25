#!/usr/bin/env node
/**
 * Export Google Search Console baseline (last 28 complete days, excluding today).
 *
 * Auth (in order):
 * 1. OAuth user (primary) — GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET
 *    or GOOGLE_OAUTH_CLIENT_JSON (Desktop app JSON from Google Cloud)
 * 2. Service account (fallback only) — GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
 *
 * Property: GSC_SITE_URL (default https://www.zyenereviews.com/)
 *
 * Usage: pnpm geo:gsc-baseline
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { google } from "googleapis";

const ROOT = join(import.meta.dirname, "..");
const OUT_DIR = join(ROOT, "reports", "gsc");
const SITE_URL = (process.env.GSC_SITE_URL ?? "https://www.zyenereviews.com/").trim();
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_REDIRECT_URI = "http://localhost";
const DEFAULT_TOKEN_PATH = join(ROOT, ".cache", "google-gsc-token.json");

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

function isOAuthConfigured() {
    if (process.env.GOOGLE_OAUTH_CLIENT_JSON?.trim()) return true;
    const id = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
    const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
    return Boolean(id && secret);
}

function hasServiceAccountEnv() {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim()) return true;
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    return Boolean(path);
}

function printOAuthSetupSteps() {
    console.error(`
=== Google Search Console export — OAuth setup required ===

Search Console usually cannot add service account users. Use OAuth with a Google account
that already has access to the property.

1. Google Cloud Console → APIs & Services → Library → enable "Google Search Console API"
2. Credentials → Create credentials → OAuth client ID → Application type: Desktop app
3. Add to .env.local (do not commit):

   GOOGLE_OAUTH_CLIENT_ID=your_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
   # optional: GOOGLE_OAUTH_CLIENT_JSON=/absolute/path/to/client_secret_....json

4. Unset GOOGLE_APPLICATION_CREDENTIALS if you want OAuth (not service account).

5. Run:  pnpm geo:gsc-baseline

6. If URL-prefix property fails, try domain property:
   GSC_SITE_URL="sc-domain:zyenereviews.com" pnpm geo:gsc-baseline

Token cache: .cache/google-gsc-token.json (gitignored)
Outputs:   reports/gsc/

Full steps: docs/GEO_OWNER_FINAL_ACTIONS.md · docs/GROWTH_OPERATIONS.md
`);
}

function resolveServiceAccountCredentials() {
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
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
    }
    if (!existsSync(path)) {
        throw new Error(`Service account file not found: ${path}`);
    }
    return JSON.parse(readFileSync(path, "utf8"));
}

function resolveOAuthClientConfig() {
    const jsonPath = process.env.GOOGLE_OAUTH_CLIENT_JSON?.trim();
    if (jsonPath) {
        if (!existsSync(jsonPath)) {
            throw new Error(`GOOGLE_OAUTH_CLIENT_JSON file not found: ${jsonPath}`);
        }
        const raw = JSON.parse(readFileSync(jsonPath, "utf8"));
        const block = raw.installed ?? raw.web;
        if (!block?.client_id || !block?.client_secret) {
            throw new Error("GOOGLE_OAUTH_CLIENT_JSON must contain installed or web client_id and client_secret");
        }
        return {
            clientId: block.client_id,
            clientSecret: block.client_secret,
            redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || block.redirect_uris?.[0] || DEFAULT_REDIRECT_URI,
        };
    }
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
    if (!clientId || !clientSecret) {
        throw new Error(
            "OAuth not configured: set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET, or GOOGLE_OAUTH_CLIENT_JSON (Desktop app JSON from Google Cloud)",
        );
    }
    return {
        clientId,
        clientSecret,
        redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || DEFAULT_REDIRECT_URI,
    };
}

function tokenCachePath() {
    return process.env.GOOGLE_OAUTH_TOKEN_PATH?.trim() || DEFAULT_TOKEN_PATH;
}

function saveTokenCache(tokens) {
    const path = tokenCachePath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(tokens, null, 2) + "\n");
    chmodSync(path, 0o600);
}

async function promptAuthorizationCode() {
    const rl = createInterface({ input, output });
    try {
        const code = await rl.question("Paste the authorization code (from the redirect URL ?code=...): ");
        return code.trim();
    } finally {
        rl.close();
    }
}

async function authorizeOAuthUser() {
    const { clientId, clientSecret, redirectUri } = resolveOAuthClientConfig();
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const cachePath = tokenCachePath();

    if (existsSync(cachePath)) {
        oauth2.setCredentials(JSON.parse(readFileSync(cachePath, "utf8")));
        try {
            const { credentials } = await oauth2.refreshAccessToken();
            oauth2.setCredentials(credentials);
            saveTokenCache(oauth2.credentials);
            console.log(`Auth: OAuth user (cached token: ${cachePath})`);
            return oauth2;
        } catch {
            console.warn("Cached OAuth token expired or invalid — re-authorizing.");
        }
    }

    const authUrl = oauth2.generateAuthUrl({
        access_type: "offline",
        scope: [SCOPE],
        prompt: "consent",
    });

    console.log("Auth: OAuth user (no valid cached token)");
    console.log("\n1. Open this URL in your browser and sign in with the Google account that owns Search Console:\n");
    console.log(authUrl);
    console.log(
        `\n2. After approving, your browser redirects to ${redirectUri} (may show "can't connect" — that is OK).`,
    );
    console.log("3. Copy the `code` query parameter from the address bar and paste it below.\n");

    const code = await promptAuthorizationCode();
    if (!code) {
        throw new Error("No authorization code provided");
    }

    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);
    saveTokenCache(tokens);
    console.log(`Token saved to ${cachePath} (not committed — see .gitignore)\n`);
    return oauth2;
}

async function createAuth() {
    if (isOAuthConfigured()) {
        return authorizeOAuthUser();
    }
    if (hasServiceAccountEnv()) {
        console.warn(
            "Warning: OAuth is not configured — using service account fallback. Search Console often rejects service accounts; prefer OAuth (see docs/GEO_OWNER_FINAL_ACTIONS.md).",
        );
        const credentials = resolveServiceAccountCredentials();
        console.log("Auth: service account (fallback)");
        return new google.auth.GoogleAuth({ credentials, scopes: [SCOPE] });
    }
    printOAuthSetupSteps();
    throw new Error("No GSC credentials configured (OAuth or service account)");
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

function explainApiError(err, authMode) {
    const status = err?.response?.status ?? err?.code;
    const msg = err?.response?.data?.error?.message ?? err?.message ?? String(err);
    const reasons = (err?.response?.data?.error?.errors ?? [])
        .map((e) => e.reason)
        .filter(Boolean)
        .join(", ");
    const parts = [
        `HTTP/status: ${status ?? "unknown"}`,
        `message: ${msg}`,
        `GSC_SITE_URL: ${SITE_URL}`,
        `auth: ${authMode}`,
    ];
    if (reasons) parts.push(`reasons: ${reasons}`);
    if (status === 403 || /permission|forbidden/i.test(msg)) {
        if (authMode === "service_account") {
            parts.push(
                "hint: Service accounts often cannot be added in Search Console. Unset GOOGLE_APPLICATION_CREDENTIALS and use OAuth (see docs/GROWTH_OPERATIONS.md).",
            );
        } else {
            parts.push(
                "hint: Sign in with the Google account that has access to this Search Console property.",
            );
        }
        parts.push('hint: Try another property: GSC_SITE_URL="sc-domain:zyenereviews.com" pnpm geo:gsc-baseline');
    }
    if (/has not been used|disabled|API has not been enabled/i.test(msg)) {
        parts.push("hint: Enable the Google Search Console API in Google Cloud Console for project zyene-reviews.");
    }
    if (/not found|invalid.*site/i.test(msg)) {
        parts.push("hint: Confirm the property exists in Search Console and matches GSC_SITE_URL exactly.");
    }
    return parts.join("\n");
}

function writeSummary({ startDate, endDate, queries, pages, queryPages, exportedAt, authMode }) {
    const lines = [
        "# GSC baseline summary",
        "",
        `**Exported:** ${exportedAt}`,
        `**Property:** \`${SITE_URL}\``,
        `**Auth:** ${authMode}`,
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
    const authMode = hasServiceAccountEnv() ? "service_account" : "oauth_user";

    let auth;
    try {
        auth = await createAuth();
    } catch (e) {
        console.error("GSC export failed (credentials):", e.message);
        if (!isOAuthConfigured() && !hasServiceAccountEnv()) {
            printOAuthSetupSteps();
        } else if (!isOAuthConfigured()) {
            console.error(
                "\nTip: Unset GOOGLE_APPLICATION_CREDENTIALS and configure OAuth (primary path).",
            );
            printOAuthSetupSteps();
        }
        process.exit(1);
    }

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
        console.error(explainApiError(err, authMode));
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
        authMode,
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
        writeSummary({ startDate, endDate, queries, pages, queryPages, exportedAt, authMode }),
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
