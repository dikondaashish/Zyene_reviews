import { JURISDICTION_RULES } from "@/lib/privacy/privacy-regions";
import type { ConsentPreferences, ConsentRecord, Jurisdiction, PrivacyState } from "@/lib/privacy/types";

/**
 * The decision function. Every gate (scripts, embeds, cookies, event
 * trackers) reads the result of this, never the raw cookie.
 *
 * Order: explicit choice beats jurisdiction defaults; Global Privacy Control
 * then always switches marketing off (opt-out of "sale/sharing" for
 * cross-context advertising). GPC never touches essential, functional or
 * analytics, and is not the same thing as Do Not Track (which is ignored).
 */
export function resolvePrivacyState(input: {
    record: ConsentRecord | null;
    jurisdiction: Jurisdiction;
    gpc: boolean;
}): PrivacyState {
    const rule = JURISDICTION_RULES[input.jurisdiction];
    const base: ConsentPreferences = input.record
        ? { functional: input.record.functional, analytics: input.record.analytics, marketing: input.record.marketing }
        : rule.defaults;
    return {
        jurisdiction: input.jurisdiction,
        decided: input.record !== null,
        granted: { ...base, marketing: base.marketing && !input.gpc },
        gpc: input.gpc,
        showBanner: input.record === null && rule.showBanner,
    };
}

/** Google Consent Mode v2 state matching the effective permissions. */
export function googleConsentModeState(prefs: ConsentPreferences) {
    const state = (on: boolean) => (on ? "granted" : "denied");
    return {
        analytics_storage: state(prefs.analytics),
        ad_storage: state(prefs.marketing),
        ad_user_data: state(prefs.marketing),
        ad_personalization: state(prefs.marketing),
        functionality_storage: state(prefs.functional),
        personalization_storage: state(prefs.functional),
        security_storage: "granted",
    } as const;
}

/** True when a change removes a category that was running (its scripts must be unloaded). */
export function isWithdrawal(previous: ConsentPreferences, next: ConsentPreferences): boolean {
    return (
        (previous.functional && !next.functional) ||
        (previous.analytics && !next.analytics) ||
        (previous.marketing && !next.marketing)
    );
}
