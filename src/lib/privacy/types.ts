/** Categories the visitor can switch. "essential" is implicit and always on. */
export const OPTIONAL_CATEGORIES = ["functional", "analytics", "marketing"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];
export type ConsentCategory = "essential" | OptionalCategory;

export type ConsentPreferences = Record<OptionalCategory, boolean>;

/** Privacy jurisdiction groups. Country codes map onto these in `privacy-regions.ts`. */
export type Jurisdiction = "EU_EEA" | "UK" | "US" | "OTHER";

/** A visitor's explicit choice, as persisted in the `zyene_consent` cookie. */
export type ConsentRecord = ConsentPreferences & {
    version: number;
    /** Jurisdiction in force when the choice was made (audit context only). */
    region: Jurisdiction;
    decidedAt: number;
};

/** Everything UI and script gates need; produced only by `resolvePrivacyState`. */
export type PrivacyState = {
    jurisdiction: Jurisdiction;
    /** True once the visitor made an explicit choice (on any subdomain). */
    decided: boolean;
    /** Effective permissions after jurisdiction defaults and GPC. */
    granted: ConsentPreferences;
    gpc: boolean;
    showBanner: boolean;
};
