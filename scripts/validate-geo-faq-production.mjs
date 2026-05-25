/**
 * Production FAQ / schema spot-check (post-deploy).
 * Fetches live HTML+RSC payload and validates FAQPage, Article duplication, disclaimers.
 *
 * Usage: node scripts/validate-geo-faq-production.mjs
 * Optional base: GEO_VALIDATE_BASE=https://www.zyenereviews.com node scripts/validate-geo-faq-production.mjs
 */
import {
    CHECKS,
    fetchPageHtml,
    validateCheckPayload,
} from "./lib/validate-geo-faq-core.mjs";

const BASE = (process.env.GEO_VALIDATE_BASE ?? "https://www.zyenereviews.com").replace(/\/$/, "");

let failed = 0;

console.log(`GEO FAQ production validation at ${BASE}\n`);
console.log(
    "Note: JSON-LD uses lazyOnload — schema may appear in RSC/flight payload before script injection.\n"
);

for (const check of CHECKS) {
    let html = "";
    try {
        ({ html } = await fetchPageHtml(BASE, check.path));
    } catch (e) {
        failed++;
        console.log(`FAIL ${check.label}`);
        console.log(`  - fetch failed: ${e.message}`);
        continue;
    }

    const { pass, issues, meta } = validateCheckPayload({
        html,
        source: BASE,
        check,
    });
    if (!pass) failed++;
    console.log(`${pass ? "PASS" : "FAIL"} ${check.label}`);
    console.log(
        `  - response bytes: ${meta.bytes}, ld+json tags: ${meta.ldJson ? "yes" : "no (RSC payload only)"}`
    );
    for (const i of issues) console.log(`  - ${i}`);
}

console.log(`\n${CHECKS.length - failed}/${CHECKS.length} passed`);
process.exit(failed > 0 ? 1 : 0);
