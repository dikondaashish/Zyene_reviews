"use server";

import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getAuthSiteOrigin } from "@/lib/routing/platform-routes";
import { beginAddBusinessOAuth } from "@/services/auth/add-business-oauth-cookie";
import { canAddBusinessToOrganization } from "@/services/auth/add-business-authorization";

export async function prepareAddBusinessGoogleOAuth(): Promise<
    { redirectTo: string; error?: never } | { redirectTo?: never; error: string }
> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: "You must be logged in to add a business" };

        const { organization } = await getActiveBusinessId({ skipCache: true });
        if (!organization?.id || !await canAddBusinessToOrganization(
            supabase, user.id, organization.id,
        )) {
            return { error: "You do not have permission to add a business" };
        }

        const nonce = await beginAddBusinessOAuth(user.id, organization.id);
        const authOrigin = getAuthSiteOrigin(
            process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000",
        );
        const redirectTo = new URL("/api/auth/callback", authOrigin);
        redirectTo.searchParams.set("next", "/businesses");
        redirectTo.searchParams.set("add_business_state", nonce);
        return { redirectTo: redirectTo.toString() };
    } catch {
        return { error: "Failed to start Google connection" };
    }
}
