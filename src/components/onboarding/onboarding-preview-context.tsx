"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { OnboardingBusiness } from "@/app/onboarding/onboarding-types";

export type OnboardingPreviewPatch = Partial<Pick<OnboardingBusiness,
    "name" | "city" | "state" | "country" | "category" | "website" | "average_rating" | "total_reviews" | "photoUrl">>;

type PreviewContextValue = { patch: OnboardingPreviewPatch; updatePreview: (next: OnboardingPreviewPatch) => void };

const PreviewContext = createContext<PreviewContextValue>({ patch: {}, updatePreview: () => {} });

/**
 * What the owner has typed or picked so far, layered over the saved business, so the preview card
 * fills in live. Kept apart from the step forms' props so a preview update never resets a form.
 */
export function OnboardingPreviewProvider({ children }: { children: ReactNode }) {
    const [patch, setPatch] = useState<OnboardingPreviewPatch>({});
    const updatePreview = useCallback((next: OnboardingPreviewPatch) => setPatch((prev) => ({ ...prev, ...next })), []);
    const value = useMemo(() => ({ patch, updatePreview }), [patch, updatePreview]);
    return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function useOnboardingPreview() {
    return useContext(PreviewContext);
}
