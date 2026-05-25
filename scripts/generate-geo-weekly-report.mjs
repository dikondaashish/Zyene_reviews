#!/usr/bin/env node
/**
 * Create a dated GEO weekly report file from the template.
 * Pulls local GSC JSON / report APIs only when present — never invents metrics.
 *
 * Usage: pnpm geo:weekly-report
 * Optional: GEO_WEEKLY_REPORT_DATE=2026-05-25 pnpm geo:weekly-report
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const TEMPLATE = join(ROOT, "reports", "geo-weekly", "week-001-template.md");
const OUT_DIR = join(ROOT, "reports", "geo-weekly");
const GSC_JSON = join(ROOT, "reports", "gsc", "gsc-baseline-latest.json");

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

function reportDate() {
    const override = process.env.GEO_WEEKLY_REPORT_DATE?.trim();
    if (override) return override;
    return new Date().toISOString().slice(0, 10);
}

function weekRange(isoDate) {
    const end = new Date(`${isoDate}T12:00:00Z`);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 6);
    return `${start.toISOString().slice(0, 10)} → ${isoDate}`;
}

function gscSection() {
    if (!existsSync(GSC_JSON)) {
        return [
            "## GSC (not exported yet)",
            "",
            "_Run `pnpm geo:gsc-baseline` first — no data injected._",
            "",
            "Link when ready: [reports/gsc/GSC_BASELINE_SUMMARY.md](../gsc/GSC_BASELINE_SUMMARY.md)",
            "",
        ].join("\n");
    }
    const data = JSON.parse(readFileSync(GSC_JSON, "utf8"));
    const topQ = [...(data.queries ?? [])]
        .sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
        .slice(0, 5);
    const lines = [
        "## GSC (from local export)",
        "",
        `**Source:** \`reports/gsc/gsc-baseline-latest.json\` · **Range:** ${data.startDate} → ${data.endDate}`,
        "",
        "### Top 5 queries (clicks)",
        "",
        "| Query | Clicks | Impressions |",
        "|-------|--------|-------------|",
    ];
    if (topQ.length === 0) {
        lines.push("| _No rows in export_ | | |");
    } else {
        for (const row of topQ) {
            lines.push(`| ${String(row.query).replace(/\|/g, "\\|")} | ${row.clicks} | ${row.impressions} |`);
        }
    }
    lines.push("", "### Top 5 pages", "", "_Paste from `gsc-top-pages-latest.csv` or GSC UI._", "");
    return lines.join("\n");
}

async function fetchReport(path, secret) {
    const base = (process.env.GEO_WEEKLY_BASE_URL ?? "https://www.zyenereviews.com").replace(/\/$/, "");
    const res = await fetch(`${base}${path}?days=7`, {
        headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) return null;
    return res.json();
}

function funnelTable(label, report) {
    if (!report) {
        return `_No ${label} data — set GROWTH_DASHBOARD_SECRET and re-run, or fill from /growth._\n`;
    }
    return [
        `| Metric | Value |`,
        `|--------|-------|`,
        `| Page views | ${report.pageViews ?? "—"} |`,
        `| Submissions | ${report.submissions ?? "—"} |`,
        `| Subscribe successes | ${report.subscribeSuccesses ?? "—"} |`,
        `| Conversion % | ${report.conversionRatePercent ?? "—"} |`,
        `| Signup clicks | ${report.signupClicks ?? "—"} |`,
        `| Pricing clicks | ${report.pricingClicks ?? "—"} |`,
        "",
    ].join("\n");
}

async function main() {
    loadEnvLocal();
    const date = reportDate();
    const outPath = join(OUT_DIR, `week-${date}.md`);

    if (!existsSync(TEMPLATE)) {
        console.error(`Missing template: ${TEMPLATE}`);
        process.exit(1);
    }

    let body = readFileSync(TEMPLATE, "utf8");
    body = body.replace("{{WEEK_DATE_RANGE}}", weekRange(date));
    body = body.replace("{{REPORT_DATE}}", date);

    const secret = process.env.GROWTH_DASHBOARD_SECRET?.trim();
    let templateReport = null;
    let localSeoReport = null;
    if (secret) {
        templateReport = await fetchReport("/api/internal/marketing/template-pack-report", secret);
        localSeoReport = await fetchReport("/api/internal/marketing/local-seo-checklist-report", secret);
    }

    const inject = [
        gscSection(),
        "## Template pack funnel",
        "",
        funnelTable("template pack", templateReport),
        "## Local SEO checklist funnel",
        "",
        funnelTable("local SEO", localSeoReport),
    ].join("\n");

    body = body.replace("{{AUTO_METRICS}}", inject);

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(outPath, body);
    console.log(`Wrote ${outPath}`);
    if (!existsSync(GSC_JSON)) {
        console.log("Note: GSC section is placeholder until pnpm geo:gsc-baseline succeeds.");
    }
    if (!secret) {
        console.log("Note: Funnel tables are placeholders — set GROWTH_DASHBOARD_SECRET to pull live counts.");
    }
}

main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
});
