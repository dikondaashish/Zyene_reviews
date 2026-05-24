/**
 * Fetches rendered marketing pages and validates FAQPage JSON-LD vs visible FAQs.
 * Usage: node scripts/validate-geo-faq-schema.mjs [baseUrl]
 * Default baseUrl: http://127.0.0.1:3000 (run `pnpm start` after `pnpm build`).
 */

const base = process.argv[2] ?? "http://127.0.0.1:3000";

const PAGES = [
    { path: "/compare", expectFaq: true },
    { path: "/compare/birdeye", expectFaq: true },
    { path: "/compare/podium", expectFaq: true },
    { path: "/compare/nicejob", expectFaq: true },
    { path: "/compare/gatherup", expectFaq: true },
    { path: "/blog/how-to-get-50-google-reviews-in-30-days", expectFaq: true },
    { path: "/case-studies/sunrise-dental-austin", expectFaq: false },
];

function extractJsonLd(html) {
    const blocks = [];
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        try {
            blocks.push(JSON.parse(m[1].trim()));
        } catch {
            blocks.push({ parseError: true, raw: m[1].slice(0, 120) });
        }
    }
    return blocks;
}

function extractVisibleFaqQuestions(html) {
    const questions = [];
    const re = /<button[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        const q = m[1].trim();
        if (q.length > 10 && q.endsWith("?")) questions.push(q);
    }
    return [...new Set(questions)];
}

function validateFaqPage(schema) {
    const issues = [];
    if (schema["@type"] !== "FAQPage") issues.push(`@type is ${schema["@type"]}, expected FAQPage`);
    if (!schema["@context"]) issues.push("missing @context");
    if (!Array.isArray(schema.mainEntity)) issues.push("mainEntity is not an array");
    else {
        for (const [i, q] of schema.mainEntity.entries()) {
            if (q["@type"] !== "Question") issues.push(`mainEntity[${i}] @type is ${q["@type"]}`);
            if (!q.name) issues.push(`mainEntity[${i}] missing name`);
            const ans = q.acceptedAnswer;
            if (!ans || ans["@type"] !== "Answer") issues.push(`mainEntity[${i}] invalid acceptedAnswer`);
            else if (!ans.text) issues.push(`mainEntity[${i}] missing answer text`);
        }
    }
    return issues;
}

async function checkPage({ path, expectFaq }) {
    const url = `${base}${path}`;
    const res = await fetch(url);
    const html = await res.text();
    const schemas = extractJsonLd(html);
    const faqPages = schemas.filter((s) => s && s["@type"] === "FAQPage");
    const visibleQuestions = extractVisibleFaqQuestions(html);
    const row = {
        path,
        status: res.status,
        faqPageCount: faqPages.length,
        visibleFaqCount: visibleQuestions.length,
        issues: [],
    };

    if (res.status !== 200) row.issues.push(`HTTP ${res.status}`);
    if (expectFaq) {
        if (faqPages.length !== 1) row.issues.push(`expected 1 FAQPage, found ${faqPages.length}`);
        if (faqPages.length === 1) {
            row.issues.push(...validateFaqPage(faqPages[0]).map((x) => `schema: ${x}`));
            const jsonQuestions = faqPages[0].mainEntity?.map((e) => e.name) ?? [];
            if (jsonQuestions.length !== visibleQuestions.length) {
                row.issues.push(
                    `FAQ count mismatch JSON-LD=${jsonQuestions.length} visible=${visibleQuestions.length}`
                );
            }
            for (const jq of jsonQuestions) {
                if (!visibleQuestions.includes(jq)) {
                    row.issues.push(`JSON-LD question not found in visible FAQ: ${jq.slice(0, 60)}…`);
                }
            }
            for (const vq of visibleQuestions) {
                if (!jsonQuestions.includes(vq)) {
                    row.issues.push(`Visible FAQ not in JSON-LD: ${vq.slice(0, 60)}…`);
                }
            }
        }
    } else if (faqPages.length > 0) {
        row.issues.push(`unexpected FAQPage on page without FAQs (${faqPages.length})`);
    }

    const otherTypes = schemas.filter((s) => s && s["@type"] && s["@type"] !== "FAQPage").map((s) => s["@type"]);
    row.otherSchemaTypes = [...new Set(otherTypes)];
    row.pass = row.issues.length === 0;
    return row;
}

async function main() {
    console.log(`Validating FAQ schema at ${base}\n`);
    const results = [];
    for (const page of PAGES) {
        results.push(await checkPage(page));
    }
    let failed = 0;
    for (const r of results) {
        const mark = r.pass ? "PASS" : "FAIL";
        if (!r.pass) failed++;
        console.log(`${mark} ${r.path}`);
        console.log(`  FAQPage blocks: ${r.faqPageCount}, visible FAQ buttons: ${r.visibleFaqCount}`);
        if (r.otherSchemaTypes?.length) console.log(`  Other JSON-LD: ${r.otherSchemaTypes.join(", ")}`);
        for (const issue of r.issues) console.log(`  - ${issue}`);
    }
    console.log(`\n${results.length - failed}/${results.length} passed`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
    console.error(e);
    process.exit(2);
});
