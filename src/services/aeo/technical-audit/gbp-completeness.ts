import type { GoogleLocationFull } from "@/services/google/listing-information";

/**
 * F5.10: GBP completeness, computed only from fields this app actually
 * retrieves (LOCATION_READ_MASK in listing-information.ts). Additional
 * categories, attributes, and photos are real GBP fields the PRD names, but
 * this app's Business Information API call does not read them — checking
 * them would mean inventing a verdict on data we never fetched, which is
 * exactly the fabrication this module exists to prevent. Every field below
 * corresponds to a real property in GoogleLocationFull.
 */
export type GbpFieldStatus = "present" | "missing" | "invalid";

export type GbpFieldAssessment = {
    field: string;
    label: string;
    status: GbpFieldStatus;
    value: string | null;
    whyItMatters: string;
    recommendation: string | null;
};

export type GbpCompletenessResult =
    | { kind: "unable_to_verify"; reason: string }
    | {
          kind: "ok";
          fields: GbpFieldAssessment[];
          /** Equal weight per field — simple and consistent; documented, not hidden. */
          score: number;
          presentCount: number;
          totalCount: number;
      };

function assess(
    field: string,
    label: string,
    value: string | null,
    whyItMatters: string,
    recommendation: string
): GbpFieldAssessment {
    const present = value !== null && value.trim().length > 0;
    return {
        field,
        label,
        status: present ? "present" : "missing",
        value: present ? value : null,
        whyItMatters,
        recommendation: present ? null : recommendation,
    };
}

export function computeGbpCompleteness(location: GoogleLocationFull | null): GbpCompletenessResult {
    if (!location) {
        return { kind: "unable_to_verify", reason: "Could not retrieve Business Profile data from Google." };
    }

    const address = location.storefrontAddress;
    const addressLine = address
        ? [address.addressLines?.join(", "), address.locality, address.administrativeArea]
              .filter(Boolean)
              .join(", ")
        : null;

    const hoursSet = (location.regularHours?.periods?.length ?? 0) > 0;

    const fields: GbpFieldAssessment[] = [
        assess(
            "title",
            "Business name",
            location.title ?? null,
            "The name AI systems and searchers see first — the core identity claim your whole AEO presence relies on.",
            "Set your business name in Google Business Profile."
        ),
        assess(
            "primaryCategory",
            "Primary category",
            location.categories?.primaryCategory?.displayName ?? null,
            "Google and AI engines use this to decide which \"best {category} in {city}\" questions you're even eligible to be recommended for.",
            "Set a primary category that matches what customers would search for."
        ),
        assess(
            "storefrontAddress",
            "Address",
            addressLine,
            "Confirms a physical location, which local-intent AI answers weight heavily.",
            "Add a complete storefront address in Google Business Profile."
        ),
        assess(
            "phone",
            "Phone number",
            location.phoneNumbers?.primaryPhone ?? null,
            "A missing phone number is one of the most common reasons AI answers omit a business from a recommendation.",
            "Add a primary phone number."
        ),
        assess(
            "websiteUri",
            "Website",
            location.websiteUri ?? null,
            "Without a website, citation-based AEO metrics have nothing to point to — visibility degrades to GBP/Maps-only.",
            "Add your website URL."
        ),
        assess(
            "hours",
            "Business hours",
            hoursSet ? "Set" : null,
            "\"Is it open now\" is one of the most common AI-assistant queries for local businesses.",
            "Set your regular business hours."
        ),
        assess(
            "description",
            "Business description",
            location.profile?.description ?? null,
            "The clearest first-person statement of what you do — source material AI systems draw on directly.",
            "Write a business description in Google Business Profile."
        ),
    ];

    const presentCount = fields.filter((f) => f.status === "present").length;

    return {
        kind: "ok",
        fields,
        score: Math.round((presentCount / fields.length) * 100),
        presentCount,
        totalCount: fields.length,
    };
}
