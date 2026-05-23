import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function restoreOriginalUserAfterAddBusiness(params: {
    admin: SupabaseClient;
    supabase: SupabaseClient;
    addBusinessUserId: string;
    oauthUserId: string;
    appUrl: string;
}): Promise<NextResponse | null> {
    const { admin, supabase, addBusinessUserId, oauthUserId, appUrl } = params;

    if (addBusinessUserId === oauthUserId) {
        return null;
    }

    await supabase.auth.signOut();

    const { data: originalUser } = await admin.auth.admin.getUserById(addBusinessUserId);

    if (originalUser?.user?.email) {
        const { data: linkData } = await admin.auth.admin.generateLink({
            type: "magiclink",
            email: originalUser.user.email,
        });

        if (linkData?.properties?.hashed_token) {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: linkData.properties.hashed_token,
                type: "magiclink",
            });

            if (!verifyError) {
                return NextResponse.redirect(`${appUrl}/businesses`);
            }

            logger.error({ err: verifyError }, "Failed to verify magic link:");
            Sentry.captureException(verifyError, { tags: { route: "auth-callback", step: "verify_magic_link" } });
        }
    }

    return NextResponse.redirect(`${appUrl}/login?message=business_added`);
}
