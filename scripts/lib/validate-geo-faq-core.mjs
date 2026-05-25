/**
 * Shared FAQ / JSON-LD validation for build and production scripts.
 */
import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "../..");
export const APP_SERVER_DIR = path.join(ROOT, ".next/server/app");

export const CHECKS = [
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
        label: "/compare/birdeye",
        path: "/compare/birdeye",
        expectFaq: 5,
        expectArticle: 0,
        expectComposite: false,
    },
    {
        label: "/compare/podium",
        path: "/compare/podium",
        expectFaq: 5,
        expectArticle: 0,
        expectComposite: false,
    },
    {
        label: "/compare/nicejob",
        path: "/compare/nicejob",
        expectFaq: 5,
        expectArticle: 0,
        expectComposite: false,
    },
    {
        label: "/compare/gatherup",
        path: "/compare/gatherup",
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

export function countType(text, type) {
    const plain = (text.match(new RegExp(`"@type":"${type}"`, "g")) ?? []).length;
    const escaped = (text.match(new RegExp(`\\\\"@type\\\\":\\\\"${type}\\\\"`, "g")) ?? []).length;
    return plain + escaped;
}

export function countFaqPageBlobs(text) {
    const plain = (text.match(/"@type":"FAQPage"/g) ?? []).length;
    const escaped = (text.match(/\\"@type\\":\\"FAQPage\\"/g) ?? []).length;
    return Math.max(plain, escaped);
}

export function parseFaqPageBlob(blob) {
    const json = blob.includes('\\"') ? blob.replace(/\\"/g, '"') : blob;
    const parsed = JSON.parse(json);
    const names = [];
    for (const q of parsed.mainEntity ?? []) {
        if (q["@type"] === "Question" && q.name) names.push(q.name);
        if (!q.acceptedAnswer?.text) throw new Error("missing answer text");
    }
    return names;
}

export function extractFaqQuestionNames(text) {
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
    if (names.length === 0) {
        const legacyRe =
            /\{"@context":"https:\/\/schema\.org","@type":"FAQPage","mainEntity":\[([\s\S]*?)\]\}/g;
        let m;
        while ((m = legacyRe.exec(text)) !== null) {
            names.push(...parseFaqPageBlob(m[0]));
        }
    }
    return [...new Set(names)];
}

export function extractVisibleFaqQuestions(html) {
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

/**
 * Resolve post-build artifacts for a route path (e.g. /compare/birdeye).
 * Tries legacy flat .rsc/.html, App Router route groups, and segment payloads.
 */
export function resolveBuildArtifacts(routePath) {
    const normalized = routePath.startsWith("/") ? routePath : `/${routePath}`;
    const rel = normalized === "/" ? "" : normalized;
    const routeGroups = ["(marketing)", "(marketing)/compare", ""];
    const candidates = new Set();

    candidates.add(path.join(APP_SERVER_DIR, `${rel}.rsc`));
    candidates.add(path.join(APP_SERVER_DIR, `${rel}.html`));

    for (const group of routeGroups) {
        const base = group
            ? path.join(APP_SERVER_DIR, group, rel.slice(1))
            : path.join(APP_SERVER_DIR, rel.slice(1));
        candidates.add(path.join(base, "page.js"));
        candidates.add(path.join(base, "page_client-reference-manifest.js"));
        candidates.add(path.join(base, "segments", "_full.segment.rsc"));
        candidates.add(path.join(base, "segments", "__PAGE__.segment.rsc"));
    }

    const files = [];
    for (const filePath of candidates) {
        if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            continue;
        }
        files.push(filePath);
    }

    let rscText = "";
    let htmlText = "";
    for (const filePath of files) {
        const text = fs.readFileSync(filePath, "utf8");
        if (filePath.endsWith(".html")) {
            htmlText += text;
        } else {
            rscText += text;
        }
    }

    return {
        files,
        rscText,
        htmlText,
        combined: rscText + htmlText,
    };
}

export function staticPayloadSufficient(check, combined) {
    if (check.expectFaq === 0) {
        return combined.length > 200;
    }
    return countFaqPageBlobs(combined) >= 1 && extractFaqQuestionNames(combined).length >= check.expectFaq;
}

/**
 * @param {{ html: string, source: string, check: typeof CHECKS[0] }} args
 */
export function validateCheckPayload({ html, source, check }) {
    const issues = [];
    const faqPageCount = countFaqPageBlobs(html);
    const articleCount = countType(html, "Article");
    const hasFaqPageString = html.includes("FAQPage") || html.includes('\\"FAQPage\\"');

    if (check.expectFaq > 0) {
        if (!hasFaqPageString) issues.push("FAQPage not found in response body");
        if (faqPageCount !== 1) issues.push(`expected 1 FAQPage blob, found ${faqPageCount}`);
        let names = [];
        try {
            names = extractFaqQuestionNames(html);
        } catch (e) {
            issues.push(e.message);
        }
        issues.push(...validateFaqSchema(names));
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
        for (const v of visible) {
            if (!names.includes(v)) issues.push(`visible not in schema: ${v}`);
        }
        if (check.expectArticle === 0 && articleCount > 0) {
            issues.push(`unexpected Article on compare (${articleCount})`);
        }
        if (check.expectArticle > 0 && articleCount < 1) {
            issues.push(`expected Article schema, found ${articleCount}`);
        }
        if (check.path.startsWith("/compare") && articleCount > 0) {
            issues.push(`unexpected Article schema on compare (${articleCount})`);
        }
    } else {
        if (faqPageCount > 0) issues.push(`unexpected FAQPage (${faqPageCount})`);
        if (faqPageCount > 0) issues.push("case study should not have FAQPage");
    }

    if (check.expectComposite) {
        if (!html.includes("Representative example")) {
            issues.push("missing header composite disclaimer");
        }
        if (!html.includes("Illustrative results")) {
            issues.push("missing illustrative results label");
        }
        const idx = html.indexOf("Representative example");
        const h1 = html.indexOf("<h1");
        if (idx === -1 || (h1 !== -1 && idx > h1 + 8000)) {
            issues.push("composite disclaimer may be buried (check manually)");
        }
    }

    const pass = issues.length === 0;
    return {
        pass,
        issues,
        meta: {
            source,
            bytes: html.length,
            ldJson: html.includes("application/ld+json"),
        },
    };
}

const FETCH_TIMEOUT_MS = 30_000;

export async function fetchPageHtml(base, routePath) {
    const url = `${base.replace(/\/$/, "")}${routePath}`;
    const res = await fetch(url, {
        headers: { "User-Agent": "Zyene-GEO-Validator/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return { url, html };
}
