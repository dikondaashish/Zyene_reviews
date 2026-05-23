import { toast } from "sonner";
import { updateOnboardingStep, updateBusinessAndLocation } from "@/app/actions/onboarding";
import type { StepBusinessLocationFormData } from "@/lib/validations/onboarding";

export async function runStep2SaveAndNext(
    businessId: string,
    getValues: () => StepBusinessLocationFormData,
    onNext: () => Promise<void>
): Promise<boolean> {
    const data = getValues();
    const updateResult = await updateBusinessAndLocation(businessId, {
        businessName: data.businessName,
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone || undefined,
    });
    if (!updateResult.success) {
        toast.error(updateResult.error || "Failed to save");
        return false;
    }
    const stepResult = await updateOnboardingStep(businessId, 3);
    if (stepResult.success) {
        toast.success("Saved! Moving to next step.");
        await onNext();
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
