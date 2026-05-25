#!/usr/bin/env node
/**
 * Production check for GET /api/internal/marketing/template-pack-report
 * Usage (do not commit the secret):
 *   GROWTH_DASHBOARD_SECRET='…' node scripts/verify-template-pack-report-production.mjs
 */
const secret = process.env.GROWTH_DASHBOARD_SECRET?.trim();
if (!secret) {
    console.error("Set GROWTH_DASHBOARD_SECRET (from Vercel → Production → Reveal).");
    process.exit(1);
}

const url =
    "https://www.zyenereviews.com/api/internal/marketing/template-pack-report?days=30";
const required = [
    "periodDays",
    "pageViews",
    "submissions",
    "subscribeSuccesses",
    "conversionRatePercent",
    "signupClicks",
    "pricingClicks",
    "latestSubmissions",
    "excludesQaTraffic",
];

const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    redirect: "follow",
});
const body = await res.json().catch(() => ({}));
const missing = required.filter((k) => !(k in body));
const latest = body.latestSubmissions ?? [];
const qaInLatest = latest.some(
    (s) =>
        (s.email ?? "").includes("template-pack-prod-qa") ||
        s.utm_source === "qa" ||
        s.utm_medium === "funnel_test" ||
        s.utm_campaign === "prod_activation"
);

console.log(
    JSON.stringify(
        {
            status: res.status,
            ok: res.ok,
            missing,
            excludesQaTraffic: body.excludesQaTraffic,
            pageViews: body.pageViews,
            subscribeSuccesses: body.subscribeSuccesses,
            latestCount: latest.length,
            qaInLatest,
            error: body.error ?? null,
        },
        null,
        2
    )
);

if (!res.ok || missing.length || qaInLatest) process.exit(1);
