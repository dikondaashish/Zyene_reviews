/**
 * Turning a cited URL into something joinable.
 *
 * Two engines return URLs that are not the source: Gemini wraps every citation
 * in a `vertexaisearch.cloud.google.com/grounding-api-redirect/...` hop. Parsing
 * a domain out of that would file EVERY Gemini citation under Google's redirect
 * host and destroy own-vs-competitor attribution entirely — the whole point of
 * tracking citations. The real domain arrives in the citation title instead.
 *
 * Recovering it from the title is a deliberate trade: the alternative is one
 * extra HTTP request per citation to follow the redirect, which at 7 citations
 * per sample is 7x the request volume for a field we can already read.
 */

export type CitationClassification = "own" | "competitor" | "directory" | "social" | "other";

export type NormalizedCitation = {
    /** Verbatim, as the engine gave it. Kept so a claim is always auditable. */
    url: string;
    /** Tracking params stripped and host canonicalised, for stable joins. */
    normalizedUrl: string;
    domain: string;
    title: string | null;
    classification: CitationClassification;
    /**
     * The URL points at a redirector, so `domain` came from the title rather
     * than from the URL itself. Lower confidence, and worth surfacing before
     * anyone builds a report on top of it.
     */
    viaRedirect: boolean;
};

export type ClassifyContext = {
    /** The business's own domains. */
    ownDomains: readonly string[];
    /** Competitor domains, in the same normalised form. */
    competitorDomains: readonly string[];
};

/** Hosts that wrap a real source rather than being one. */
const REDIRECT_HOSTS = [
    "vertexaisearch.cloud.google.com",
    "www.google.com", // /url?q= wrappers
];

/**
 * Params that identify a campaign or a session rather than a document. Left in
 * place, two citations to the same page would never join.
 */
const TRACKING_PARAMS = [
    /^utm_/i,
    /^(fbclid|gclid|msclkid|dclid|yclid)$/i,
    /^(ref|referrer|source)$/i,
    /^(mc_cid|mc_eid)$/i,
    /^_hs(enc|mi)$/i,
];

const DIRECTORY_DOMAINS = [
    "yelp.com", "angi.com", "angieslist.com", "bbb.org", "thumbtack.com",
    "homeadvisor.com", "houzz.com", "porch.com", "nextdoor.com",
    "tripadvisor.com", "trustpilot.com", "yellowpages.com", "manta.com",
    "consumeraffairs.com", "expertise.com", "birdeye.com",
];

const SOCIAL_DOMAINS = [
    "facebook.com", "instagram.com", "x.com", "twitter.com", "linkedin.com",
    "tiktok.com", "youtube.com", "reddit.com", "pinterest.com", "threads.net",
];

/** Lowercased, `www.` removed. The form every comparison here uses. */
export function canonicalDomain(hostOrDomain: string): string {
    return hostOrDomain.trim().toLowerCase().replace(/^www\./, "").replace(/\.$/, "");
}

/** True when `domain` is `parent` or a subdomain of it — never a substring match. */
export function isSameOrSubdomain(domain: string, parent: string): boolean {
    const a = canonicalDomain(domain);
    const b = canonicalDomain(parent);
    // Substring matching would make "notyelp.com" a match for "yelp.com".
    return a === b || a.endsWith(`.${b}`);
}

/**
 * Pulls a domain out of a citation title.
 *
 * Gemini titles are bare domains ("forbes.com"). Other engines put a headline
 * there, so anything that does not look like a hostname is rejected rather than
 * guessed at — a wrong domain is worse than an absent one.
 */
export function domainFromTitle(title: string | null): string | null {
    if (!title) return null;
    const trimmed = title.trim().toLowerCase();
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(trimmed)) return null;
    if (!/\.[a-z]{2,}$/.test(trimmed)) return null;
    return canonicalDomain(trimmed);
}

function stripTracking(url: URL): URL {
    for (const key of [...url.searchParams.keys()]) {
        if (TRACKING_PARAMS.some((pattern) => pattern.test(key))) {
            url.searchParams.delete(key);
        }
    }
    return url;
}

export function classifyDomain(
    domain: string,
    context: ClassifyContext
): CitationClassification {
    if (!domain) return "other";
    if (context.ownDomains.some((own) => isSameOrSubdomain(domain, own))) return "own";
    if (context.competitorDomains.some((c) => isSameOrSubdomain(domain, c))) return "competitor";
    if (DIRECTORY_DOMAINS.some((d) => isSameOrSubdomain(domain, d))) return "directory";
    if (SOCIAL_DOMAINS.some((d) => isSameOrSubdomain(domain, d))) return "social";
    return "other";
}

export function normalizeCitation(
    input: { url: string; title: string | null },
    context: ClassifyContext
): NormalizedCitation {
    let parsed: URL | null = null;
    try {
        parsed = new URL(input.url);
    } catch {
        parsed = null;
    }

    // Unparseable: keep the row, claim nothing about it. Dropping it would
    // quietly shrink the citation denominator.
    if (!parsed) {
        return {
            url: input.url,
            normalizedUrl: input.url,
            domain: "",
            title: input.title,
            classification: "other",
            viaRedirect: false,
        };
    }

    const host = canonicalDomain(parsed.hostname);
    const isRedirect = REDIRECT_HOSTS.some((r) => isSameOrSubdomain(host, r));
    const fromTitle = isRedirect ? domainFromTitle(input.title) : null;

    // A redirect whose title tells us nothing leaves the domain EMPTY rather
    // than recording the redirector. "Unknown" is honest; "google.com cited you"
    // is a fabrication that would poison every attribution built on it.
    const domain = isRedirect ? (fromTitle ?? "") : host;

    const normalized = stripTracking(new URL(parsed.href));
    normalized.hash = "";
    normalized.hostname = host;
    if (normalized.pathname !== "/" && normalized.pathname.endsWith("/")) {
        normalized.pathname = normalized.pathname.slice(0, -1);
    }

    return {
        url: input.url,
        normalizedUrl: normalized.toString().replace(/\?$/, ""),
        domain,
        title: input.title,
        classification: classifyDomain(domain, context),
        viaRedirect: isRedirect,
    };
}
