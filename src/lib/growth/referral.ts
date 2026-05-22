// ─────────────────────────────────────────────────────────────────────────────
// Referral program — Phase 7
// ─────────────────────────────────────────────────────────────────────────────

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REFERRAL_TRIAL_DAYS = 14;
export const DEFAULT_TRIAL_DAYS = 7;

export function isValidReferrerUserId(value: string | null | undefined): boolean {
    if (!value?.trim()) return false;
    return UUID_RE.test(value.trim());
}

/** Public signup link: ?ref=<referrer_user_id> */
export function buildReferralSignupUrl(referrerUserId: string): string {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com";
    const isLocal = rootDomain.includes("localhost");
    const host = rootDomain.split(":")[0]?.replace(/^www\./, "") ?? rootDomain;
    const base = isLocal
        ? `http://${rootDomain}/signup`
        : `https://auth.${host}/signup`;
    const url = new URL(base);
    url.searchParams.set("ref", referrerUserId);
    url.searchParams.set("utm_source", "referral");
    url.searchParams.set("utm_medium", "friend");
    url.searchParams.set("utm_campaign", "referral_program");
    return url.toString();
}

export function introTrialDaysForOrganization(referredByUserId: string | null | undefined): number {
    return referredByUserId ? REFERRAL_TRIAL_DAYS : DEFAULT_TRIAL_DAYS;
}
