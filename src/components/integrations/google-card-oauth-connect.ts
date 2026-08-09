import { createClient } from "@/lib/db/supabase/client";
import { GOOGLE_CONNECT_SCOPES, GOOGLE_SEARCH_CONSOLE_SCOPES } from "@/services/google/oauth-scopes";
import { toast } from "sonner";

function buildRedirectTo(businessId: string): string {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    return rootDomain.includes("localhost")
        ? `http://${rootDomain}/api/auth/callback?next=/settings/integrations&biz=${encodeURIComponent(businessId)}`
        : `https://auth.${rootDomain}/api/auth/callback?next=/settings/integrations&biz=${encodeURIComponent(businessId)}`;
}

export async function startGoogleOAuthConnect(businessId: string): Promise<void> {
    const supabase = createClient();
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                scopes: GOOGLE_CONNECT_SCOPES,
                redirectTo: buildRedirectTo(businessId),
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });
        if (error) throw error;
    } catch {
        toast.error("Failed to initiate Google connection");
    }
}

/**
 * E-2: incremental consent for Search Console. Same redirect target as a
 * normal reconnect — `include_granted_scopes` widens the existing grant
 * instead of replacing it, so this never drops `business.manage` access.
 */
export async function startGoogleSearchConsoleConnect(businessId: string): Promise<void> {
    const supabase = createClient();
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                scopes: GOOGLE_SEARCH_CONSOLE_SCOPES,
                redirectTo: buildRedirectTo(businessId),
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                    include_granted_scopes: "true",
                },
            },
        });
        if (error) throw error;
    } catch {
        toast.error("Failed to initiate Search Console connection");
    }
}
