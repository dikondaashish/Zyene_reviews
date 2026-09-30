import { toast } from "sonner";

import { prepareGoogleOnboardingOAuth } from "@/app/actions/onboarding/google-oauth-start";

export async function navigateToGoogleBusinessOAuthOnboarding(businessId: string): Promise<void> {
    try {
        const result = await prepareGoogleOnboardingOAuth(businessId, `${window.location.origin}/onboarding`);
        if (result.success) window.location.href = result.url;
        else toast.error(result.error);
    } catch {
        toast.error("Unable to start Google connection. Please try again.");
    }
}
