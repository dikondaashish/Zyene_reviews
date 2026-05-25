#!/usr/bin/env node
/**
 * Safe QA checks for marketing lead magnets (dry-run by default).
 *
 * Usage:
 *   node scripts/qa-lead-magnet-flow.mjs              # dry-run (no writes)
 *   node scripts/qa-lead-magnet-flow.mjs --execute    # live subscribe tests (QA email/UTM only)
 *
 * Env (optional, from .env.local):
 *   QA_MARKETING_BASE_URL — default http://localhost:3000
 *   GROWTH_DASHBOARD_SECRET — for authenticated report checks
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const EXECUTE = process.argv.includes("--execute");
const BASE = (process.env.QA_MARKETING_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

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

const QA_UTM = { utm_source: "qa", utm_medium: "funnel_test", utm_campaign: "lead_magnet_qa" };
const QA_EMAIL = `template-pack-prod-qa-${Date.now()}@example.com`;

async function check401(path) {
    const url = `${BASE}${path}`;
    try {
        const res = await fetch(url);
        return { url, status: res.status, ok: res.status === 401 };
    } catch (err) {
        return { url, status: 0, ok: false, skipped: true, error: err?.message ?? "fetch failed" };
    }
}

async function checkReport(path, secret) {
    const url = `${BASE}${path}?days=7`;
    try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
        const body = await res.json().catch(() => ({}));
        return { url, status: res.status, ok: res.ok, hasPageViews: "pageViews" in body };
    } catch (err) {
        return { url, status: 0, ok: false, skipped: true, error: err?.message ?? "fetch failed" };
    }
}

async function subscribe(source, label) {
    const url = `${BASE}/api/marketing/newsletter/subscribe`;
    const body = { email: QA_EMAIL, source, ...QA_UTM };
    if (!EXECUTE) {
        console.log(`[dry-run] POST ${url} source=${source}`);
        return { skipped: true };
    }
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data, label };
}

async function main() {
    loadEnvLocal();
    const secret = process.env.GROWTH_DASHBOARD_SECRET?.trim();

    console.log(`Mode: ${EXECUTE ? "EXECUTE (QA email only)" : "DRY-RUN"}`);
    console.log(`Base URL: ${BASE}\n`);

    console.log("--- Unauthenticated report APIs (expect 401) ---");
    for (const path of [
        "/api/internal/marketing/template-pack-report",
        "/api/internal/marketing/local-seo-checklist-report",
    ]) {
        const r = await check401(path);
        if (r.skipped) {
            console.log(`SKIP ${path} — ${r.error} (start dev server or set QA_MARKETING_BASE_URL)`);
            continue;
        }
        console.log(r.ok ? `PASS ${r.status} ${path}` : `FAIL ${r.status} ${path}`);
    }

    if (secret) {
        console.log("\n--- Authenticated report APIs ---");
        for (const path of [
            "/api/internal/marketing/template-pack-report",
            "/api/internal/marketing/local-seo-checklist-report",
        ]) {
            const r = await checkReport(path, secret);
            if (r.skipped) {
                console.log(`SKIP ${path} — ${r.error}`);
                continue;
            }
            console.log(
                r.ok && r.hasPageViews ? `PASS ${r.status} ${path}` : `FAIL ${r.status} ${path}`,
            );
        }
    } else {
        console.log("\nSkip authenticated report checks — set GROWTH_DASHBOARD_SECRET in .env.local");
    }

    console.log("\n--- Subscribe flows (QA UTM excluded from nurture in app) ---");
    const flows = [
        ["review_request_templates", "template pack"],
        ["local_seo_checklist", "local SEO checklist"],
    ];
    for (const [source, label] of flows) {
        const r = await subscribe(source, label);
        if (r.skipped) continue;
        console.log(`${r.ok ? "PASS" : "FAIL"} ${label}: HTTP ${r.status} newLead=${r.data?.newLead}`);
    }

    if (EXECUTE) {
        console.log("\n--- Duplicate submit (same email) ---");
        const dup = await subscribe("local_seo_checklist", "duplicate");
        console.log(
            `${dup.ok ? "PASS" : "FAIL"} duplicate: HTTP ${dup.status} message=${dup.data?.message ?? "—"}`,
        );
    }

    console.log("\nOwner follow-up:");
    console.log("- Resend: confirm welcome / pack email in dashboard (QA inbox if using real domain)");
    console.log("- Inngest: growth-marketing-nurture should NOT run for utm_medium=funnel_test");
    console.log("- Supabase: see docs/LEAD_NURTURE_QA_RUNBOOK.md for SQL + cleanup");
    console.log("- Full runbook: docs/LEAD_NURTURE_QA_RUNBOOK.md");
}

main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
});
