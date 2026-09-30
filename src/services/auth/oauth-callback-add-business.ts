import { NextResponse } from "next/server";
import { checkLimit } from "@/lib/stripe/check-limits";
import { BUSINESS_LIMIT_UPGRADE_BILLING_HREF } from "@/lib/billing/business-limit-upgrade-href";
import { fetchOAuthAddBusinessGbpDetails } from "./oauth-callback-add-business-gbp";
import { createOAuthAddBusinessRecord } from "./oauth-callback-add-business-create";
import { restoreOriginalUserAfterAddBusiness } from "./oauth-callback-add-business-restore";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

export async function runOAuthAddBusinessFlow(params: {
    admin: SupabaseClient;
    supabase: SupabaseClient;
    data: { user: User; session: Session | null };
    appUrl: string;
    addBusinessOrgId: string;
    originalUserId: string;
}): Promise<NextResponse> {
    const { admin, supabase, data, appUrl, addBusinessOrgId, originalUserId } = params;

    const limitCheck = await checkLimit(addBusinessOrgId, "businesses");
    if (!limitCheck.allowed) {
        return NextResponse.redirect(
            `${String(appUrl).replace(/\/+$/, "")}${BUSINESS_LIMIT_UPGRADE_BILLING_HREF}`,
        );
    }

    const finalAccessToken = data.session?.provider_token ?? undefined;
    const finalRefreshToken = data.session?.provider_refresh_token ?? undefined;
    const gbp = await fetchOAuthAddBusinessGbpDetails(finalAccessToken);

    await createOAuthAddBusinessRecord({
        admin,
        addBusinessOrgId,
        ownerUserId: originalUserId,
        user: data.user,
        gbp,
        finalAccessToken,
        finalRefreshToken,
    });

    const restored = await restoreOriginalUserAfterAddBusiness({
        admin,
        supabase,
        originalUserId,
        oauthUserId: data.user.id,
        appUrl,
    });
    if (restored) return restored;

    return NextResponse.redirect(`${appUrl}/businesses`);
}
