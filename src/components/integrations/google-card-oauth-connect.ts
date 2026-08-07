import { createClient } from "@/lib/db/supabase/client";
import { GOOGLE_CONNECT_SCOPES } from "@/services/google/oauth-scopes";
import { toast } from "sonner";

export async function startGoogleOAuthConnect(businessId: string): Promise<void> {
    const supabase = createClient();
    try {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
        const redirectTo = rootDomain.includes("localhost")
            ? `http://${rootDomain}/api/auth/callback?next=/settings/integrations&biz=${encodeURIComponent(businessId)}`
            : `https://auth.${rootDomain}/api/auth/callback?next=/settings/integrations&biz=${encodeURIComponent(businessId)}`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                scopes: GOOGLE_CONNECT_SCOPES,
                redirectTo,
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
