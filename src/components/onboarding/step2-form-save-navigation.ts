import { toast } from "sonner";
import { updateOnboardingStep, updateBusinessAndLocation } from "@/app/actions/onboarding";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";
import type { OnboardingBusiness } from "@/app/onboarding/onboarding-types";
import { knownIndustry } from "@/components/onboarding/step3-form-categories";

export async function runStep2SaveAndNext(
    businessId: string,
    getValues: () => StepBusinessLocationFormData,
    onNext: (saved: { slug: string | null }) => Promise<void>
): Promise<boolean> {
    const data = getValues();
    const updateResult = await updateBusinessAndLocation(businessId, {
        businessName: data.businessName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || "US",
        website: data.website || undefined,
        category: data.category || undefined,
        phone: data.phone || undefined,
    });
    if (!updateResult.success) {
        toast.error(updateResult.error || "Failed to save");
        return false;
    }
    const stepResult = await updateOnboardingStep(businessId, 3);
    if (stepResult.success) {
        toast.success("Saved! Moving to next step.");
        await onNext({ slug: "slug" in updateResult ? (updateResult.slug ?? null) : null });
        return true;
    }
    toast.error(stepResult.error || "Failed to advance");
    return false;
}

export async function runStep2Skip(businessId: string, onSkip: () => Promise<void>): Promise<void> {
    const result = await updateOnboardingStep(businessId, 3);
    if (result.success) await onSkip();
    else toast.error(result.error || "Failed to save progress");
}

/**
 * What happens once step 2 is saved. Only a real Google Business Profile connection counts as
 * "Google connected"; a pick from the name search can still carry the industry Google detected.
 */
export function step2AfterSave(
    viaGoogle: boolean,
    pickedCategory: string | undefined,
    onNext: (viaGoogle: boolean) => Promise<void>,
    onBusinessUpdate?: (info: Partial<OnboardingBusiness>) => void,
): (saved: { slug: string | null }) => Promise<void> {
    return async ({ slug }) => {
        const picked = knownIndustry(pickedCategory);
        if (!viaGoogle && picked && picked !== "other") onBusinessUpdate?.({ category: picked, categoryFromGoogle: true });
        if (slug) onBusinessUpdate?.({ slug });
        await onNext(viaGoogle);
    };
}
