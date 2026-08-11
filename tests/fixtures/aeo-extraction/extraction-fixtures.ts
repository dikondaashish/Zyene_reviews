import {
    citationsPresent,
    citationsUnavailable,
    failedSample,
    noAnswerSample,
    okSample,
    engineError,
} from "../../../src/services/aeo/engines/engine-result";
import type { EngineSampleResult } from "../../../src/services/aeo/engines/engine-types";
import type { BrandAlias, BrandKind } from "../../../src/services/aeo/extraction/brand-matcher";
import type { CitationClassification } from "../../../src/services/aeo/extraction/citation-normalizer";

/**
 * E-6: the labeled fixture set extraction is regression-tested against.
 *
 * "Labeled" here means each `expected` block is either (a) DERIVED FROM REAL
 * production output whose correctness is checkable by inspection — this
 * business's own name literally appears in this literal answer text, verified
 * against the stored answer, not asserted from memory — or (b) constructed so
 * the correct answer is true BY CONSTRUCTION: the fixture author wrote a piece
 * of text that either does or does not contain a given string, which is a
 * fact, not a judgment call.
 *
 * This is NOT the PRD-1 "200-sample human-audited set, ≥95% agreement" success
 * metric. That is a product-operations activity against live traffic with a
 * real human reviewer, and claiming to have produced 200 human labels here
 * would be exactly the kind of fabricated-authority this whole module exists
 * to prevent. What this is: the INFRASTRUCTURE the PRD's enabler (E-6) asks
 * for — a fixture set + a harness that fails loudly on regression — sized to
 * grow toward that target with real labels over time, not simulate having
 * reached it already.
 *
 * Two fixtures below (SUBDOMAIN-OWNERSHIP, DUPLICATE-CITATION) assert what the
 * code CURRENTLY does, which is not what §2 PRD-2's edge-case table says it
 * should do. Flagged in each fixture's description rather than silently
 * "fixed" here — this file's job is to catch regressions in what exists, not
 * to make a product decision about closing a spec gap.
 */

export type ExtractionFixture = {
    id: string;
    description: string;
    source: "real" | "constructed";
    result: EngineSampleResult;
    context: {
        brands: readonly BrandAlias[];
        ownDomains: readonly string[];
        competitorDomains: readonly string[];
    };
    expected: {
        ownBrandNamed: boolean | null;
        /** In ordinal order. Empty means "no brand from context appears at all". */
        mentions: readonly { label: string; kind: BrandKind; citedOnly: boolean }[];
        /** Order-independent — citations are checked as a set, keyed on domain. */
        citations: readonly {
            domain: string;
            classification: CitationClassification;
            viaRedirect?: boolean;
        }[];
    };
};

const WOLFPACK_CONTEXT = {
    brands: [
        {
            kind: "own" as const,
            competitorId: null,
            label: "Wolfpack BBQ & Burgers",
            aliases: ["Wolfpack BBQ & Burgers", "Wolfpack BBQ", "Wolfpack"],
        },
        {
            kind: "competitor" as const,
            competitorId: "comp-gates",
            label: "Gates Bar-B-Q",
            aliases: ["Gates Bar-B-Q", "Gates"],
        },
        {
            kind: "competitor" as const,
            competitorId: "comp-joes",
            label: "Joe's KC BBQ",
            aliases: ["Joe's KC BBQ", "Joe's Kansas City Bar-B-Que", "Joe's KC"],
        },
        {
            kind: "competitor" as const,
            competitorId: "comp-bryants",
            label: "Arthur Bryant's Barbeque",
            aliases: ["Arthur Bryant's Barbeque", "Arthur Bryant's Barbecue", "Arthur Bryant's"],
        },
    ],
    ownDomains: ["wolfpackkc.com"],
    competitorDomains: ["arthurbryantsbbq.com"],
};

/** A stand-in for Gemini's real redirect wrapper — the encoded id carries no signal, only the host does. */
function redirectUrl(n: number): string {
    return `https://vertexaisearch.cloud.google.com/grounding-api-redirect/FIXTURE-${n}`;
}

const BASE = { modelId: "gemini-2.5-flash", latencyMs: 1000, costUnits: 1 };

export const EXTRACTION_FIXTURES: ExtractionFixture[] = [
    {
        id: "real-wolfpack-named-and-cited",
        description:
            "Real Gemini answer, sample b2bc3199 (2026-08-07): own brand named in " +
            "prose and cited via its real domain; a real competitor also named and " +
            "cited; two directory-less 'other' sources and two social citations.",
        source: "real",
        result: okSample({
            ...BASE,
            answerText:
                "Kansas City boasts a vibrant BBQ scene with several top-rated establishments near its downtown area. Among the highly recommended spots are Q39, Jack Stack Barbecue (Freight House location), Arthur Bryant's, Slaps BBQ, and Wolfpack BBQ & Burgers.\n\n" +
                "*   **Arthur Bryant's:** Considered a classic and \"OG\" Kansas City BBQ spot, Arthur Bryant's has a long history and is known for its unique sauce.\n" +
                "*   **Wolfpack BBQ & Burgers:** Located at 910 East 5th Street, Wolfpack offers \"Fresh, High-quality & Original Downtown Kansas City Barbecue\".",
            citations: citationsPresent([
                { url: redirectUrl(1), title: "facebook.com" },
                { url: redirectUrl(2), title: "coupleinthekitchen.com" },
                { url: redirectUrl(3), title: "globalphile.com" },
                { url: redirectUrl(4), title: "arthurbryantsbbq.com" },
                { url: redirectUrl(5), title: "reddit.com" },
                { url: redirectUrl(6), title: "wolfpackkc.com" },
            ]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [
                { label: "Arthur Bryant's Barbeque", kind: "competitor", citedOnly: false },
                { label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false },
            ],
            citations: [
                { domain: "facebook.com", classification: "social", viaRedirect: true },
                { domain: "coupleinthekitchen.com", classification: "other", viaRedirect: true },
                { domain: "globalphile.com", classification: "other", viaRedirect: true },
                { domain: "arthurbryantsbbq.com", classification: "competitor", viaRedirect: true },
                { domain: "reddit.com", classification: "social", viaRedirect: true },
                { domain: "wolfpackkc.com", classification: "own", viaRedirect: true },
            ],
        },
    },
    {
        id: "real-wolfpack-absent",
        description:
            "Real Gemini answer, sample 9f554dfa (2026-08-07): own brand genuinely " +
            "absent while three real competitors are all named. The true-negative " +
            "case that matters most — a false positive here is indistinguishable " +
            "from the original fabrication bug.",
        source: "real",
        result: okSample({
            ...BASE,
            answerText:
                "Kansas City is renowned for its distinctive barbecue style, offering a wide array of exceptional restaurants.\n\n" +
                "*   **Joe's Kansas City Bar-B-Que** is frequently cited as one of the city's most iconic barbecue destinations.\n" +
                "*   **Arthur Bryant's Barbecue** stands as a historic Kansas City institution.\n" +
                "*   **Gates Bar-B-Q** is a Kansas City legend since 1946.\n" +
                "*   **Q39** offers a championship barbecue experience.",
            citations: citationsPresent([
                { url: redirectUrl(7), title: "coupleinthekitchen.com" },
                { url: redirectUrl(8), title: "arthurbryantsbbq.com" },
                { url: redirectUrl(9), title: "youtube.com" },
            ]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: false,
            mentions: [
                { label: "Joe's KC BBQ", kind: "competitor", citedOnly: false },
                { label: "Arthur Bryant's Barbeque", kind: "competitor", citedOnly: false },
                { label: "Gates Bar-B-Q", kind: "competitor", citedOnly: false },
            ],
            citations: [
                { domain: "coupleinthekitchen.com", classification: "other", viaRedirect: true },
                { domain: "arthurbryantsbbq.com", classification: "competitor", viaRedirect: true },
                { domain: "youtube.com", classification: "social", viaRedirect: true },
            ],
        },
    },
    {
        id: "cited-only-is-not-named",
        description:
            "Own brand appears ONLY as a citation source, never in the answer's " +
            "prose. Must NOT count as ownBrandNamed — being a source is not the " +
            "same as being recommended (extract-sample.ts's own stated design).",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "For Kansas City barbecue, Joe's KC BBQ is the classic choice most locals mention first.",
            citations: citationsPresent([{ url: "https://wolfpackkc.com/menu", title: "Wolfpack BBQ & Burgers Menu" }]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: false,
            mentions: [
                { label: "Joe's KC BBQ", kind: "competitor", citedOnly: false },
                { label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: true },
            ],
            citations: [{ domain: "wolfpackkc.com", classification: "own" }],
        },
    },
    {
        id: "common-word-brand-not-fuzzy-matched",
        description:
            "A brand named 'Apex' must not fire on the unrelated word 'apex' used " +
            "in ordinary prose ('apex predator of the local food scene') — only an " +
            "exact alias, at a word boundary, counts. The false-positive-danger " +
            "brand-matcher.ts itself documents as the reason this is deterministic.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText:
                "Kansas City BBQ has reached the apex predator of the local food scene with several standout spots, though none are run by a business called Apex Barbecue.",
            citations: citationsUnavailable(),
        }),
        context: {
            brands: [
                { kind: "own", competitorId: null, label: "Apex Barbecue", aliases: ["Apex Barbecue", "Apex BBQ"] },
            ],
            ownDomains: [],
            competitorDomains: [],
        },
        expected: {
            ownBrandNamed: true,
            mentions: [{ label: "Apex Barbecue", kind: "own", citedOnly: false }],
            citations: [],
        },
    },
    {
        id: "ordinal-follows-first-occurrence-not-listing-order",
        description:
            "Two brands named in prose; ordinal must follow the position they " +
            "actually appear at, not the order brands happen to be listed in the " +
            "business's own alias context.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Gates Bar-B-Q opened first, but most reviewers now recommend Wolfpack BBQ for its burnt ends.",
            citations: citationsUnavailable(),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [
                { label: "Gates Bar-B-Q", kind: "competitor", citedOnly: false },
                { label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false },
            ],
            citations: [],
        },
    },
    {
        id: "cited-only-sorts-after-every-named-brand",
        description:
            "A cited-only brand must sort after ALL named brands regardless of its " +
            "citation's ordinal position — being a source is real but secondary to " +
            "being recommended.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Gates Bar-B-Q is the top pick for Kansas City barbecue this year.",
            citations: citationsPresent([{ url: "https://wolfpackkc.com", title: "Wolfpack BBQ & Burgers" }]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: false,
            mentions: [
                { label: "Gates Bar-B-Q", kind: "competitor", citedOnly: false },
                { label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: true },
            ],
            citations: [{ domain: "wolfpackkc.com", classification: "own" }],
        },
    },
    {
        id: "redirect-with-non-domain-title-leaves-domain-empty",
        description:
            "A Gemini redirect whose title is prose, not a domain, must leave " +
            "domain EMPTY rather than falling back to the redirector host — a " +
            "fabricated 'google.com cited you' is worse than an honest unknown.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Wolfpack BBQ is a standout new spot downtown.",
            citations: citationsPresent([{ url: redirectUrl(10), title: "Best BBQ Guide 2026" }]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [{ label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false }],
            citations: [{ domain: "", classification: "other", viaRedirect: true }],
        },
    },
    {
        id: "tracking-params-stripped-for-stable-joins",
        description:
            "utm_source and fbclid must be stripped from normalizedUrl so two " +
            "citations to the same page (one with tracking, one without) join as " +
            "one page rather than two.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Read more about Wolfpack BBQ on Yelp.",
            citations: citationsPresent([
                { url: "https://www.yelp.com/biz/wolfpack-bbq?utm_source=chatgpt&fbclid=abc123", title: "Yelp" },
            ]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [{ label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false }],
            citations: [{ domain: "yelp.com", classification: "directory" }],
        },
    },
    {
        id: "subdomain-ownership-is-assumed-automatic-not-per-PRD",
        description:
            "KNOWN GAP vs the plan doc: PRD-2's edge-case table says 'blog.x.com is " +
            "not assumed to be x.com's' and requires the user to confirm owned " +
            "domains individually. isSameOrSubdomain in citation-normalizer.ts does " +
            "NOT make that distinction — any subdomain of an owned domain is " +
            "classified 'own' automatically. This fixture documents the CURRENT " +
            "behaviour so a future change is a deliberate decision, not a silent " +
            "regression discovered here. Flagged in the E-6 handoff, not fixed here.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "See Wolfpack BBQ's catering menu.",
            citations: citationsPresent([{ url: "https://catering.wolfpackkc.com/menu", title: "Catering" }]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [{ label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false }],
            citations: [{ domain: "catering.wolfpackkc.com", classification: "own" }],
        },
    },
    {
        id: "duplicate-citation-not-deduped-not-per-PRD",
        description:
            "KNOWN GAP vs the plan doc: PRD-2's edge-case table says a URL cited " +
            "twice in one answer should be deduped, keeping the first ordinal. " +
            "extractSample maps every citation item independently and does not " +
            "dedupe. This fixture documents the CURRENT (two-row) behaviour.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Wolfpack BBQ is well reviewed.",
            citations: citationsPresent([
                { url: "https://wolfpackkc.com", title: "Wolfpack BBQ & Burgers" },
                { url: "https://wolfpackkc.com", title: "Wolfpack BBQ & Burgers" },
            ]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [{ label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false }],
            citations: [
                { domain: "wolfpackkc.com", classification: "own" },
                { domain: "wolfpackkc.com", classification: "own" },
            ],
        },
    },
    {
        id: "unparseable-url-kept-not-dropped",
        description:
            "A citation URL that fails URL parsing must be kept — with domain empty " +
            "and classification 'other' — rather than silently dropped, which would " +
            "shrink the citation denominator without anyone noticing.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Wolfpack BBQ is highly rated.",
            citations: citationsPresent([{ url: "not a url at all", title: null }]),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [{ label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false }],
            citations: [{ domain: "", classification: "other" }],
        },
    },
    {
        id: "failed-sample-has-no-answer-to-read",
        description:
            "A failed call carries no answer text at all. ownBrandNamed must be " +
            "NULL, never false — a transport failure is not evidence of absence " +
            "(QA #2).",
        source: "constructed",
        result: failedSample({
            modelId: "gemini-2.5-flash",
            error: engineError("upstream_unavailable", "503"),
            latencyMs: 500,
        }),
        context: WOLFPACK_CONTEXT,
        expected: { ownBrandNamed: null, mentions: [], citations: [] },
    },
    {
        id: "no-answer-sample-is-a-refusal-not-a-miss",
        description:
            "The engine ran but declined to answer. Excluded from every " +
            "denominator, same as a failure — ownBrandNamed must be null.",
        source: "constructed",
        result: noAnswerSample({
            modelId: "gpt-4o",
            reason: "content_policy",
            latencyMs: 800,
            costUnits: 1,
        }),
        context: WOLFPACK_CONTEXT,
        expected: { ownBrandNamed: null, mentions: [], citations: [] },
    },
    {
        id: "citations-unavailable-still-extracts-mentions-from-prose",
        description:
            "An engine that never exposes structured citations (some ChatGPT " +
            "modes) must still let prose-based brand matching run — citation " +
            "availability and mention detection are independent questions.",
        source: "constructed",
        result: okSample({
            modelId: "gpt-4o",
            latencyMs: 900,
            costUnits: 1,
            answerText: "Wolfpack BBQ and Gates Bar-B-Q are both excellent choices in Kansas City.",
            citations: citationsUnavailable(),
        }),
        context: WOLFPACK_CONTEXT,
        expected: {
            ownBrandNamed: true,
            mentions: [
                { label: "Wolfpack BBQ & Burgers", kind: "own", citedOnly: false },
                { label: "Gates Bar-B-Q", kind: "competitor", citedOnly: false },
            ],
            citations: [],
        },
    },
    {
        id: "no-brand-from-context-appears-at-all",
        description:
            "An answer about the right topic that happens to name none of the " +
            "brands in context — zero mentions is a real, valid outcome, not a " +
            "sign the matcher is broken.",
        source: "constructed",
        result: okSample({
            ...BASE,
            answerText: "Kansas City has a rich barbecue tradition dating back over a century, with dozens of local spots worth trying.",
            citations: citationsUnavailable(),
        }),
        context: WOLFPACK_CONTEXT,
        expected: { ownBrandNamed: false, mentions: [], citations: [] },
    },
];
