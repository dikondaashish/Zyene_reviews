// ─────────────────────────────────────────────────────────────────────────────
// UTM capture & attribution — Phase 6
// ─────────────────────────────────────────────────────────────────────────────

export const UTM_COOKIE_NAME = "zyene_utm";
export const UTM_COOKIE_MAX_AGE_DAYS = 30;

export interface UtmParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    ref?: string;
}

const UTM_KEYS: (keyof UtmParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "ref",
];

export function parseUtmFromSearchParams(searchParams: URLSearchParams): UtmParams {
    const out: UtmParams = {};
    for (const key of UTM_KEYS) {
        const v = searchParams.get(key);
        if (v) out[key] = v;
    }
    return out;
}

export function hasUtmParams(params: UtmParams): boolean {
    return UTM_KEYS.some((k) => params[k]);
}

export function serializeUtm(params: UtmParams): string {
    return JSON.stringify(params);
}

export function deserializeUtm(raw: string | null | undefined): UtmParams | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as UtmParams;
        return hasUtmParams(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function appendUtmToUrl(baseUrl: string, utm: UtmParams | null): string {
    if (!utm || !hasUtmParams(utm)) return baseUrl;
    const url = new URL(baseUrl, "https://zyenereviews.com");
    for (const key of UTM_KEYS) {
        const v = utm[key];
        if (v) url.searchParams.set(key, v);
    }
    return url.pathname + url.search;
}

/** Standard UTM template for Google Ads ops team */
export function buildGoogleAdsUtm(campaign: string, content?: string): UtmParams {
    return {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: campaign,
        utm_content: content,
    };
}

export function buildMetaAdsUtm(campaign: string): UtmParams {
    return {
        utm_source: "facebook",
        utm_medium: "paid_social",
        utm_campaign: campaign,
    };
}

export function isPaidTraffic(utm: UtmParams | null): boolean {
    if (!utm) return false;
    const medium = utm.utm_medium?.toLowerCase() ?? "";
    const source = utm.utm_source?.toLowerCase() ?? "";
    return (
        medium === "cpc" ||
        medium === "paid_social" ||
        medium === "paid" ||
        source === "google" ||
        source === "facebook" ||
        source === "instagram"
    );
}
