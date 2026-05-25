/**
 * Validates FAQPage JSON-LD in post-build RSC payloads (rendered server output).
 * Run after `pnpm build`: node scripts/validate-geo-faq-build.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const CHECKS = [
    {
        label: "/compare",
        rsc: ".next/server/app/compare.rsc",
        html: ".next/server/app/compare.html",
        expectFaq: 5,
    },
    {
        label: "/resources/review-request-templates",
        rsc: ".next/server/app/resources/review-request-templates.rsc",
        html: ".next/server/app/resources/review-request-templates.html",
        expectFaq: 5,
    },
    {
        label: "/compare/birdeye",
        rsc: ".next/server/app/compare/birdeye.rsc",
        html: ".next/server/app/compare/birdeye.html",
        expectFaq: 5,
    },
    {
        label: "/compare/podium",
        rsc: ".next/server/app/compare/podium.rsc",
        html: ".next/server/app/compare/podium.html",
        expectFaq: 5,
    },
    {
        label: "/compare/nicejob",
        rsc: ".next/server/app/compare/nicejob.rsc",
        html: ".next/server/app/compare/nicejob.html",
        expectFaq: 5,
    },
    {
        label: "/compare/gatherup",
        rsc: ".next/server/app/compare/gatherup.rsc",
        html: ".next/server/app/compare/gatherup.html",
        expectFaq: 5,
    },
    {
        label: "/blog/how-to-get-50-google-reviews-in-30-days",
        rsc: ".next/server/app/blog/how-to-get-50-google-reviews-in-30-days.rsc",
        html: ".next/server/app/blog/how-to-get-50-google-reviews-in-30-days.html",
        expectFaq: 5,
    },
    {
        label: "/blog/birdeye-pricing-breakdown-2026",
        rsc: ".next/server/app/blog/birdeye-pricing-breakdown-2026.rsc",
        html: ".next/server/app/blog/birdeye-pricing-breakdown-2026.html",
        expectFaq: 5,
    },
    {
        label: "/blog/negative-feedback-shield",
        rsc: ".next/server/app/blog/negative-feedback-shield.rsc",
        html: ".next/server/app/blog/negative-feedback-shield.html",
        expectFaq: 5,
    },
    {
        label: "/case-studies/sunrise-dental-austin",
        rsc: ".next/server/app/case-studies/sunrise-dental-austin.rsc",
        html: ".next/server/app/case-studies/sunrise-dental-austin.html",
        expectFaq: 0,
    },
];

function countType(text, type) {
    return (text.match(new RegExp(`"@type":"${type}"`, "g")) ?? []).length;
}

function extractFaqQuestionNames(text) {
    const blobRe =
        /\{"@context":"https:\/\/schema\.org","@type":"FAQPage","mainEntity":\[([\s\S]*?)\]\}/g;
    const names = [];
    let m;
    while ((m = blobRe.exec(text)) !== null) {
        try {
            const parsed = JSON.parse(m[0]);
            for (const q of parsed.mainEntity) {
                if (q["@type"] === "Question" && q.name) names.push(q.name);
                if (!q.acceptedAnswer?.text) throw new Error("missing answer text");
            }
        } catch (e) {
            throw new Error(`FAQPage JSON parse failed: ${e.message}`);
        }
    }
    return names;
}

function extractVisibleFaqQuestions(html) {
    const visible = [];
    const re = /font-medium text-foreground[^>]*>([^<]+\?)</g;
    let m;
    while ((m = re.exec(html)) !== null) {
        const q = m[1]
            .replace(/\\u2019/g, "'")
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'");
        if (q.length > 12) visible.push(q);
    }
    return [...new Set(visible)];
}

function validateFaqSchema(names) {
    const issues = [];
    if (names.length === 0) issues.push("no questions parsed");
    for (const n of names) {
        if (!n.endsWith("?")) issues.push(`question may be malformed: ${n.slice(0, 40)}`);
    }
    return issues;
}

let failed = 0;

console.log("GEO FAQ build validation (RSC payloads)\n");

for (const { label, rsc, html, expectFaq } of CHECKS) {
    const rscText = fs.readFileSync(path.join(ROOT, rsc), "utf8");
    const htmlText = fs.existsSync(path.join(ROOT, html))
        ? fs.readFileSync(path.join(ROOT, html), "utf8")
        : "";
    const payload = rscText + htmlText;
    const faqPageCount = countType(payload, "FAQPage");
    const issues = [];

    if (expectFaq > 0) {
        if (faqPageCount !== 1) issues.push(`expected 1 FAQPage, found ${faqPageCount}`);
        let names = [];
        try {
            names = extractFaqQuestionNames(rscText);
        } catch (e) {
            issues.push(e.message);
        }
        issues.push(...validateFaqSchema(names));
        if (names.length !== expectFaq) {
            issues.push(`schema questions ${names.length}, expected ${expectFaq}`);
        }
        const visible = extractVisibleFaqQuestions(htmlText);
        if (visible.length !== expectFaq) {
            issues.push(`visible questions ${visible.length}, expected ${expectFaq}`);
        }
        for (const n of names) {
            if (!visible.includes(n)) issues.push(`schema not visible: ${n}`);
        }
        for (const v of visible) {
            if (!names.includes(v)) issues.push(`visible not in schema: ${v}`);
        }
        const article = countType(rscText, "Article");
        const webPage = countType(rscText, "WebPage");
        if (label.startsWith("/compare") && article > 0) {
            issues.push(`unexpected Article schema on compare (${article})`);
        }
    } else {
        if (faqPageCount > 0) issues.push(`unexpected FAQPage (${faqPageCount})`);
        if (!payload.includes("Representative example")) issues.push("missing composite disclaimer");
        if (!payload.includes("Illustrative results")) issues.push("missing illustrative results label");
        if (faqPageCount > 0) issues.push("case study should not have FAQPage");
    }

    const pass = issues.length === 0;
    if (!pass) failed++;
    console.log(`${pass ? "PASS" : "FAIL"} ${label}`);
    for (const i of issues) console.log(`  - ${i}`);
    if (pass && expectFaq > 0) {
        const names = extractFaqQuestionNames(rscText);
        console.log(`  - FAQPage: 1 block, ${names.length} Q&A, matches visible UI`);
    }
}

console.log(`\n${CHECKS.length - failed}/${CHECKS.length} passed`);
process.exit(failed > 0 ? 1 : 0);
