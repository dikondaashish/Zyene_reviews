import type { OnboardingBusiness } from "@/app/onboarding/onboarding-types";
import { ONBOARDING_STEP, onboardingPhaseIndex } from "@/app/onboarding/onboarding-types";
import { STEP3_CATEGORIES } from "./step3-form-categories";
import type { OnboardingPreviewPatch } from "./onboarding-preview-context";

export type OnboardingPreview = {
    name: string | null;
    place: string;
    category: string | null;
    website: string | null;
    rating: number | null;
    reviews: number;
    photoUrl: string | null;
    /** Shown when Google has no photo: a sample cover for the owner's industry (generated, stored in /public). */
    sampleCoverUrl: string;
};

const SAMPLE_COVERS = new Set(["restaurant", "coffee", "salon", "dental", "gym", "spa", "hotel", "retail", "automotive", "healthcare"]);

export function sampleCoverFor(category: string | null | undefined): string {
    return `/onboarding/covers/${category && SAMPLE_COVERS.has(category) ? category : "other"}.jpg`;
}

/** Sign-up names the business "<Name>'s Business"; until the owner gives a real one there is none to show. */
function realName(name: string | null | undefined): string | null {
    const trimmed = name?.trim();
    return trimmed && !/'s Business$/.test(trimmed) ? trimmed : null;
}

export function buildOnboardingPreview(business: OnboardingBusiness | null, patch: OnboardingPreviewPatch): OnboardingPreview {
    const merged = { ...business, ...patch };
    const category = STEP3_CATEGORIES.find((c) => c.value === merged.category)?.label ?? null;
    const rating = Number(merged.average_rating);
    return {
        name: realName(merged.name),
        place: [merged.city, merged.state].filter(Boolean).join(", "),
        category,
        website: merged.website ?? null,
        rating: Number.isFinite(rating) && rating > 0 ? rating : null,
        reviews: Number(merged.total_reviews) || 0,
        photoUrl: merged.photoUrl ?? null,
        sampleCoverUrl: sampleCoverFor(merged.category),
    };
}

export type ChecklistItem = { label: string; state: "done" | "current" | "todo" };

/** The setup building up as the owner goes, in the order they meet each part. */
export function buildSetupChecklist(step: number, preview: OnboardingPreview, googleConnected: boolean): ChecklistItem[] {
    const phase = onboardingPhaseIndex(step);
    const item = (label: string, done: boolean, current: boolean): ChecklistItem => ({ label, state: done ? "done" : current ? "current" : "todo" });
    return [
        item("Your details", phase > 0, phase === 0),
        item("Business found", phase > 1 || (phase === 1 && step === ONBOARDING_STEP.details), step === ONBOARDING_STEP.business),
        item("Industry chosen", Boolean(preview.category) && phase > 1, step === ONBOARDING_STEP.details),
        item("Google reviews connected", googleConnected, false),
        item("Plan picked", phase > 3, phase === 3),
        item("Replies on autopilot", phase > 4, phase === 4),
    ];
}
