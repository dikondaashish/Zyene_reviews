import { toast } from "sonner";

import { prepareGoogleOnboardingOAuth } from "@/app/actions/onboarding/google-oauth-start";

export async function navigateToGoogleBusinessOAuthOnboarding(
    businessId: string,
    inFlight: { current: boolean },
    setPending: (pending: boolean) => void,
): Promise<void> {
    // React state alone cannot block a second click before the next render.
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    try {
        const result = await prepareGoogleOnboardingOAuth(businessId, `${window.location.origin}/onboarding`);
        if (result.success) {
            window.location.href = result.url;
            // Keep the guard until this document unloads, including slow redirects.
            return;
        }
        toast.error(result.error);
    } catch {
        toast.error("Unable to start Google connection. Please try again.");
    }
    inFlight.current = false;
    setPending(false);
}
