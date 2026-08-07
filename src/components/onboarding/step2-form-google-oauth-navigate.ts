import { toast } from "sonner";

import { GBP_SCOPE } from "@/services/google/oauth-scopes";

export function navigateToGoogleBusinessOAuthOnboarding(): void {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
        toast.error(
            "Google sign-in is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID in your project settings (e.g. Vercel Environment Variables) and redeploy."
        );
        return;
    }
    const redirectUri = `${window.location.origin}/onboarding`;
    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", GBP_SCOPE);
    oauthUrl.searchParams.set("access_type", "offline");
    oauthUrl.searchParams.set("prompt", "consent");
    window.location.href = oauthUrl.toString();
}
