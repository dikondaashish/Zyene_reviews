/**
 * Production FAQ / schema spot-check (post-deploy).
 * Fetches live HTML+RSC payload and validates FAQPage, Article duplication, disclaimers.
 *
 * Usage: node scripts/validate-geo-faq-production.mjs
 * Optional base: GEO_VALIDATE_BASE=https://zyenereviews.com node scripts/validate-geo-faq-production.mjs
 */
const BASE = (process.env.GEO_VALIDATE_BASE ?? "https://zyenereviews.com").replace(/\/$/, "");

const CHECKS = [
    {
        label: "/compare/birdeye",
        path: "/compare/birdeye",
        expectFaq: 5,
        expectArticle: 0,
        expectComposite: false,
    },
    {
        label: "/compare",
        path: "/compare",
        expectFaq: 5,
        expectArticle: 0,
        expectComposite: false,
    },
    {
        label: "/resources/review-request-templates",
        path: "/resources/review-request-templates",
        expectFaq: 5,
        expectArticle: 0,
        expectComposite: false,
    },
    {
        label: "/blog/how-to-get-50-google-reviews-in-30-days",
        path: "/blog/how-to-get-50-google-reviews-in-30-days",
        expectFaq: 5,
        expectArticle: 1,
        expectComposite: false,
    },
    {
        label: "/blog/birdeye-pricing-breakdown-2026",
        path: "/blog/birdeye-pricing-breakdown-2026",
        expectFaq: 5,
        expectArticle: 1,
        expectComposite: false,
    },
    {
        label: "/blog/negative-feedback-shield",
        path: "/blog/negative-feedback-shield",
        expectFaq: 5,
        expectArticle: 1,
        expectComposite: false,
    },
    {
        label: "/case-studies/sunrise-dental-austin",
        path: "/case-studies/sunrise-dental-austin",
        expectFaq: 0,
        expectArticle: 0,
        expectComposite: true,
    },
];

function countType(text, type) {
    const plain = (text.match(new RegExp(`"@type":"${type}"`, "g")) ?? []).length;
    const escaped = (text.match(new RegExp(`\\\\"@type\\\\":\\\\"${type}\\\\"`, "g")) ?? []).length;
    return plain + escaped;
}

function parseFaqPageBlob(blob) {
    const json = blob.includes('\\"') ? blob.replace(/\\"/g, '"') : blob;
    const parsed = JSON.parse(json);
    const names = [];
    for (const q of parsed.mainEntity ?? []) {
        if (q["@type"] === "Question" && q.name) names.push(q.name);
        if (!q.acceptedAnswer?.text) throw new Error("missing answer text");
    }
    return names;
}

function extractFaqQuestionNames(text) {
    const names = [];
    const plainRe =
        /\{"@context":"https:\/\/schema\.org","@type":"FAQPage","mainEntity":\[[\s\S]*?\]\}/g;
    const escapedRe =
        /\{\\"@context\\":\\"https:\/\/schema\.org\\",\\"@type\\":\\"FAQPage\\",\\"mainEntity\\":\[[\s\S]*?\]\}/g;
    for (const re of [plainRe, escapedRe]) {
        let m;
        while ((m = re.exec(text)) !== null) {
            names.push(...parseFaqPageBlob(m[0]));
        }
    }
    return [...new Set(names)];
}

function countFaqPageBlobs(text) {
    const plain = (text.match(/"@type":"FAQPage"/g) ?? []).length;
    const escaped = (text.match(/\\"@type\\":\\"FAQPage\\"/g) ?? []).length;
    return Math.max(plain, escaped > 0 ? 1 : 0, plain > 0 ? 1 : 0);
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

async function fetchPage(path) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, {
        headers: { "User-Agent": "Zyene-GEO-Validator/1.0" },
        redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return { url, html };
}

let failed = 0;

console.log(`GEO FAQ production validation at ${BASE}\n`);
console.log(
    "Note: JSON-LD uses lazyOnload — schema may appear in RSC/flight payload before script injection.\n"
);

for (const check of CHECKS) {
    const issues = [];
    let html = "";
    try {
        ({ html } = await fetchPage(check.path));
    } catch (e) {
        issues.push(`fetch failed: ${e.message}`);
        failed++;
        console.log(`FAIL ${check.label}`);
        for (const i of issues) console.log(`  - ${i}`);
        continue;
    }

    const faqPageCount = countFaqPageBlobs(html);
    const articleCount = countType(html, "Article");
    const hasLdJsonTag = html.includes("application/ld+json");
    const hasFaqPageString = html.includes("FAQPage");

    if (check.expectFaq > 0) {
        if (!hasFaqPageString) issues.push("FAQPage not found in response body");
        if (faqPageCount !== 1) issues.push(`expected 1 FAQPage blob, found ${faqPageCount}`);
        let names = [];
        try {
            names = extractFaqQuestionNames(html);
        } catch (e) {
            issues.push(e.message);
        }
        if (names.length !== check.expectFaq) {
            issues.push(`schema questions ${names.length}, expected ${check.expectFaq}`);
        }
        const visible = extractVisibleFaqQuestions(html);
        if (visible.length !== check.expectFaq) {
            issues.push(`visible questions ${visible.length}, expected ${check.expectFaq}`);
        }
        for (const n of names) {
            if (!visible.includes(n)) issues.push(`schema not in visible UI: ${n}`);
        }
        if (check.expectArticle === 0 && articleCount > 0) {
            issues.push(`unexpected Article on compare (${articleCount})`);
        }
        if (check.expectArticle > 0 && articleCount < 1) {
            issues.push(`expected Article schema, found ${articleCount}`);
        }
    } else {
        if (faqPageCount > 0) issues.push(`unexpected FAQPage (${faqPageCount})`);
    }

    if (check.expectComposite) {
        if (!html.includes("Representative example")) issues.push("missing header composite disclaimer");
        if (!html.includes("Illustrative results")) issues.push("missing illustrative results label");
        const idx = html.indexOf("Representative example");
        const h1 = html.indexOf("<h1");
        if (idx === -1 || (h1 !== -1 && idx > h1 + 8000)) {
            issues.push("composite disclaimer may be buried (check manually)");
        }
    }

    const pass = issues.length === 0;
    if (!pass) failed++;
    console.log(`${pass ? "PASS" : "FAIL"} ${check.label}`);
    console.log(`  - response bytes: ${html.length}, ld+json tags: ${hasLdJsonTag ? "yes" : "no (RSC payload only)"}`);
    for (const i of issues) console.log(`  - ${i}`);
}

console.log(`\n${CHECKS.length - failed}/${CHECKS.length} passed`);
process.exit(failed > 0 ? 1 : 0);
