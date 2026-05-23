import {
    deserializeUtm,
    UTM_COOKIE_NAME,
    type UtmParams,
} from "@/lib/growth/utm";
import { isValidReferrerUserId } from "@/lib/growth/referral";
import { isPlausibleMobileNumber } from "@/lib/validations/phone";

export function parseUtmFromRequest(request: Request): UtmParams | null {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const utmCookie = cookieHeader
        .split("; ")
        .find((row) => row.startsWith(`${UTM_COOKIE_NAME}=`));
    if (!utmCookie) return null;
    const raw = decodeURIComponent(utmCookie.split("=").slice(1).join("="));
    return deserializeUtm(raw);
}

export function resolveReferrerUserId(request: Request, newUserId: string): string | null {
    const urlRef = new URL(request.url).searchParams.get("ref");
    const candidates = [urlRef];
    const cookieHeader = request.headers.get("cookie") ?? "";
    const utmCookie = cookieHeader
        .split("; ")
        .find((row) => row.startsWith(`${UTM_COOKIE_NAME}=`));
    if (utmCookie) {
        const raw = decodeURIComponent(utmCookie.split("=").slice(1).join("="));
        const utm = deserializeUtm(raw);
        if (utm?.ref) candidates.push(utm.ref);
    }
    for (const ref of candidates) {
        if (!isValidReferrerUserId(ref) || ref === newUserId) continue;
        return ref;
    }
    return null;
}

export function signUpPhoneFromUserMetadata(user: { user_metadata?: Record<string, unknown> }): string | null {
    const raw = user.user_metadata?.phone;
    if (typeof raw !== "string") return null;
    const t = raw.trim();
    if (!t || !isPlausibleMobileNumber(t)) return null;
    return t;
}

/** Explicit opt-in for SMS review alerts (Twilio / toll-free compliance). Default false. */
export function smsReviewAlertsConsentFromUserMetadata(user: { user_metadata?: Record<string, unknown> }): boolean {
    const v = user.user_metadata?.sms_review_alerts_consent;
    if (v === true) return true;
    if (typeof v === "string") return v.toLowerCase() === "true";
    return false;
}

export function safeNextPath(raw: string | null): string {
    const fallback = "/dashboard";
    if (!raw) return fallback;

    const candidate = raw.startsWith("/") ? raw : `/${raw}`;
    if (candidate.startsWith("//")) return fallback;
    if (candidate.includes("\\") || candidate.includes("://")) return fallback;
    return candidate;
}
