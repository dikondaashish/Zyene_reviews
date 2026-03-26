import type { GoogleLocationFull } from "./listing-information";

export interface ProfileHealthCheck {
    id: string;
    label: string;
    ok: boolean;
    hint?: string;
}

export interface ProfileHealthResult {
    score: number;
    checks: ProfileHealthCheck[];
}

const WEIGHT = 20;

/**
 * Simple 0–100 completeness score from Google Location fields (5 × 20).
 */
export function computeProfileHealth(loc: GoogleLocationFull | null | undefined): ProfileHealthResult {
    const checks: ProfileHealthCheck[] = [];

    const titleOk = !!(loc?.title && String(loc.title).trim().length > 1);
    checks.push({
        id: "title",
        label: "Business name on Google",
        ok: titleOk,
        hint: "Set a clear title that matches your brand.",
    });

    const websiteOk = !!(loc?.websiteUri && /^https?:\/\//i.test(String(loc.websiteUri).trim()));
    checks.push({
        id: "website",
        label: "Website URL",
        ok: websiteOk,
        hint: "Add your site so customers can book or learn more.",
    });

    const phoneOk = !!(loc?.phoneNumbers?.primaryPhone && String(loc.phoneNumbers.primaryPhone).trim().length >= 7);
    checks.push({
        id: "phone",
        label: "Primary phone",
        ok: phoneOk,
        hint: "A reachable phone number improves calls from Maps.",
    });

    const desc = loc?.profile?.description?.trim() || "";
    const descOk = desc.length >= 40;
    checks.push({
        id: "description",
        label: "Listing description (40+ characters)",
        ok: descOk,
        hint: "Describe services and what makes you different.",
    });

    const hoursOk = !!(loc?.regularHours?.periods && loc.regularHours.periods.length > 0);
    checks.push({
        id: "hours",
        label: "Business hours",
        ok: hoursOk,
        hint: "Add regular hours so Google shows when you are open.",
    });

    const score = checks.filter((c) => c.ok).length * WEIGHT;

    return { score, checks };
}
