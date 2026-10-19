import { resolvePrivacyState } from "@/lib/privacy/consent-policy";
import { CONSENT_COOKIE_NAME, parseConsent, readCookieValue } from "@/lib/privacy/consent-record";
import { GPC_HEADER, JURISDICTION_COOKIE_NAME, parseJurisdictionCookie } from "@/lib/privacy/jurisdiction-cookie";

const META_COOKIE_PATTERN = /^fb\.1\.\d{1,16}\.[A-Za-z0-9._-]{1,200}$/;
const CLIENT_GPC_HEADER = "x-zyene-gpc";

function safeMetaCookie(cookieHeader: string, name: "_fbp" | "_fbc"): string {
    const value = readCookieValue(cookieHeader, name);
    return value && META_COOKIE_PATTERN.test(value) ? value : "";
}

/** Snapshot the current effective marketing choice for the Stripe subscription. */
export function metaConsentMetadataFromRequest(request: Pick<Request, "headers">): Record<string, string> {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const jurisdictionCookie = parseJurisdictionCookie(readCookieValue(cookieHeader, JURISDICTION_COOKIE_NAME));
    const privacy = resolvePrivacyState({
        record: parseConsent(readCookieValue(cookieHeader, CONSENT_COOKIE_NAME)),
        jurisdiction: jurisdictionCookie?.jurisdiction ?? "OTHER",
        gpc: request.headers.get(GPC_HEADER)?.trim() === "1" ||
            request.headers.get(CLIENT_GPC_HEADER)?.trim() === "1" || jurisdictionCookie?.gpc === true,
    });

    if (!privacy.granted.marketing) {
        return { meta_marketing_consent: "0", meta_fbp: "", meta_fbc: "" };
    }

    return {
        meta_marketing_consent: "1",
        meta_fbp: safeMetaCookie(cookieHeader, "_fbp"),
        meta_fbc: safeMetaCookie(cookieHeader, "_fbc"),
    };
}
