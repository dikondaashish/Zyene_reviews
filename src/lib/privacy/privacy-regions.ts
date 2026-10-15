import type { ConsentPreferences, Jurisdiction } from "@/lib/privacy/types";

/**
 * Jurisdiction rules: the single place that decides how each region behaves.
 * Behaviour is engineering policy that supports the applicable rules; it is
 * not legal advice and has not by itself been confirmed by counsel.
 */

/** EU member states plus EEA (Iceland, Liechtenstein, Norway): GDPR + ePrivacy. */
const EU_EEA = new Set([
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV",
    "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO",
]);
/** UK GDPR + PECR. Crown dependencies have their own laws and fall back to OTHER (opt-in). */
const UK = new Set(["GB"]);
/** United States and inhabited territories. */
const US = new Set(["US", "PR", "GU", "VI", "AS", "MP"]);

export type JurisdictionRule = {
    /** opt-in: nothing optional runs until the visitor agrees. opt-out: runs until they object. */
    model: "opt-in" | "opt-out";
    /** Show the first-visit banner. Opt-out regions rely on the persistent "Privacy choices" link. */
    showBanner: boolean;
    /** Effective permissions before any explicit choice. */
    defaults: ConsentPreferences;
};

const OPT_IN: JurisdictionRule = {
    model: "opt-in",
    showBanner: true,
    defaults: { functional: false, analytics: false, marketing: false },
};

export const JURISDICTION_RULES: Record<Jurisdiction, JurisdictionRule> = {
    EU_EEA: OPT_IN,
    UK: OPT_IN,
    // US state laws (e.g. CCPA/CPRA) are opt-out for analytics and "sale/sharing";
    // GPC is applied on top in `resolvePrivacyState`.
    US: { model: "opt-out", showBanner: false, defaults: { functional: true, analytics: true, marketing: true } },
    // Unknown or unreviewed countries get the most protective behaviour.
    OTHER: OPT_IN,
};

export const JURISDICTIONS = Object.keys(JURISDICTION_RULES) as Jurisdiction[];

export function isJurisdiction(value: unknown): value is Jurisdiction {
    return typeof value === "string" && (JURISDICTIONS as string[]).includes(value);
}

/** ISO 3166-1 alpha-2 (as sent in Vercel's `x-vercel-ip-country`) to jurisdiction. */
export function jurisdictionForCountry(country: string | null | undefined): Jurisdiction {
    const code = country?.trim().toUpperCase() ?? "";
    if (EU_EEA.has(code)) return "EU_EEA";
    if (UK.has(code)) return "UK";
    if (US.has(code)) return "US";
    return "OTHER";
}
