/**
 * Prevent adding the active Zyene business as its own “competitor” by matching
 * Google Maps URL signals and normalized business name.
 */

const PLACE_ID_LIKE = /ChIJ[A-Za-z0-9_-]{10,}/g;

/** Lowercase, strip extra punctuation, collapse spaces — for loose name equality. */
export function normalizeBusinessNameForCompare(name: string): string {
    return name
        .toLowerCase()
        .replace(/[''`]/g, "")
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Collect comparable tokens from a Google Maps / Places URL (place id fragments, cid, etc.).
 */
export function collectGoogleMapsFingerprints(raw: string | null | undefined): Set<string> {
    const out = new Set<string>();
    if (!raw || typeof raw !== "string") return out;
    const s = raw.trim();
    if (!s) return out;

    try {
        const u = new URL(s);
        for (const key of ["query_place_id", "placeid", "q"] as const) {
            const v = u.searchParams.get(key);
            if (v) {
                const dec = decodeURIComponent(v).trim();
                if (dec) out.add(dec);
            }
        }
        const cid = u.searchParams.get("cid");
        if (cid) out.add(`cid:${cid}`);
        const ftid = u.searchParams.get("ftid");
        if (ftid) out.add(`ftid:${ftid}`);
    } catch {
        /* non-absolute URL — still scan for place ids */
    }

    for (const m of s.match(PLACE_ID_LIKE) || []) {
        out.add(m);
    }

    return out;
}

function setsOverlap(a: Set<string>, b: Set<string>): boolean {
    if (a.size === 0 || b.size === 0) return false;
    for (const x of a) {
        if (b.has(x)) return true;
    }
    return false;
}

export type OwnBusinessContext = {
    businessName: string;
    /** Google listing / review URLs for this business */
    googleUrls: Array<string | null | undefined>;
    /** `review_platforms.google_location_id` (numeric or resource tail) */
    googleLocationId?: string | null;
};

/**
 * Returns true if this competitor row would duplicate the user’s own business.
 */
export function isCompetitorOwnBusiness(
    ctx: OwnBusinessContext,
    competitorName: string,
    competitorGoogleUrl: string | null | undefined
): boolean {
    const ownName = normalizeBusinessNameForCompare(ctx.businessName || "");
    const compName = normalizeBusinessNameForCompare(competitorName || "");
    if (ownName.length >= 3 && compName.length >= 3 && ownName === compName) {
        return true;
    }

    const ownPrints = new Set<string>();
    for (const u of ctx.googleUrls) {
        for (const p of collectGoogleMapsFingerprints(u ?? undefined)) {
            ownPrints.add(p);
        }
    }

    const loc = ctx.googleLocationId?.trim();
    if (loc) {
        ownPrints.add(`loc:${loc}`);
        ownPrints.add(loc);
    }

    const compPrints = collectGoogleMapsFingerprints(competitorGoogleUrl ?? undefined);
    if (setsOverlap(ownPrints, compPrints)) {
        return true;
    }

    if (loc && competitorGoogleUrl && competitorGoogleUrl.includes(loc)) {
        return true;
    }

    return false;
}
