"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Step3FormCategoryGrid } from "./step3-form-category-grid";
import { useStep3Form } from "./use-step3-form";
import { Step3FormSupportEmail } from "./step3-form-support-email";
import { ONBOARDING_ACTION, OnboardingStepCard } from "./onboarding-step-card";
import { knownIndustry } from "./step3-form-categories";
import { useReviewLinkDraft } from "./use-review-link-draft";
import { Step3ReviewLinkField } from "./step3-review-link-field";

/** Only when Google picked a real tile: never for typed-in details, "Other" or "uncategorized". */
export function showGoogleBadge(category: string | undefined, fromGoogle: boolean): boolean {
    const industry = knownIndustry(category);
    return fromGoogle && industry !== null && industry !== "other";
}

interface Step3FormProps {
    businessId: string;
    businessName: string;
    city: string;
    initialCategory?: string;
    /** Prefill for the reply address: the business's saved email, else the owner's sign-up email. */
    defaultSupportEmail?: string;
    /** True only when Google chose the saved industry in this session; drives the "Found on Google" badge. */
    categoryFromGoogle?: boolean;
    /** The current review link (collectratings.com/<slug>); the field is hidden when unknown. */
    businessSlug?: string;
    /** Gets what the owner saved, so going Back shows their choices rather than the defaults. */
    onNext: (category: string, slug: string) => void;
    isLoading?: boolean;
}

export function Step3Form({
    businessId,
    initialCategory,
    defaultSupportEmail = "",
    categoryFromGoogle = false,
    businessSlug = "",
    onNext,
    isLoading: externalIsLoading = false,
}: Step3FormProps) {
    const link = useReviewLinkDraft(businessId, businessSlug);
    const [linkError, setLinkError] = useState<string | null>(null);
    // The step moves on below, once both the link and the industry are saved.
    const { form, isLoading, selectedCategory, onSubmit } = useStep3Form(
        businessId,
        initialCategory,
        () => {},
        externalIsLoading,
        defaultSupportEmail,
    );
    // The link saves first: if it is taken, the owner stays here to pick another.
    const submit = (e: React.FormEvent) => form.handleSubmit(async (data) => {
        setLinkError(null);
        const saved = await link.save();
        if (!saved.ok) {
            setLinkError(saved.error ?? null);
            return;
        }
        if (await onSubmit(data)) onNext(data.category, saved.slug);
    })(e);
    const linkBlocked = link.status === "taken" || link.status === "invalid";

    return (
        <form onSubmit={(e) => void submit(e)}>
            <OnboardingStepCard
                title="What's your industry?"
                description="We'll tailor your review templates and reply suggestions to match. Not listed? Pick Other."
                headerAside={showGoogleBadge(initialCategory, categoryFromGoogle) ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/5 px-2 py-1 text-xs font-medium text-success">
                        <Check className="size-3.5" aria-hidden />Found on Google
                    </span>
                ) : null}
                footer={
                    <Button type="submit" disabled={!selectedCategory || isLoading || linkBlocked} className={ONBOARDING_ACTION}>
                        {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                        {isLoading ? "Saving…" : "Continue"}
                        {!isLoading && <ArrowRight className="size-4" aria-hidden />}
                    </Button>
                }
            >
                <div className="space-y-5">
                    <Step3FormCategoryGrid
                        control={form.control}
                        isLoading={isLoading}
                        onTriggerCategory={() => form.trigger("category")}
                    />
                    {form.formState.errors.category && (
                        <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                    )}
                    <Step3FormSupportEmail
                        register={form.register}
                        error={form.formState.errors.supportEmail?.message}
                        disabled={isLoading}
                    />
                    {businessSlug ? (
                        <Step3ReviewLinkField value={link.value} status={link.status} onChange={link.setValue} disabled={isLoading} />
                    ) : null}
                    {linkError && <p role="alert" className="text-sm text-destructive">{linkError}</p>}
                </div>
            </OnboardingStepCard>
        </form>
    );
}
