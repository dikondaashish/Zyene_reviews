import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { acceptBusinessInvitationAdmin } from "@/lib/auth/accept-business-invitation";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { createClient } from "@/lib/db/supabase/server";
import { logger } from "@/lib/logger";
import { runOAuthNewUserSignup } from "@/services/auth/oauth-callback-new-user";
import { resolveOAuthInviteParam } from "@/services/auth/oauth-invite";
import { getAppSiteOrigin } from "@/lib/routing/platform-routes";
import { safeNextPath } from "@/lib/routing/safe-next-path";

export async function completeGoogleIdentityLogin(
    request: Request,
    inviteToken: string | null,
    requestedNextPath: string | null,
): Promise<NextResponse> {
    const { origin } = new URL(request.url);
    const appUrl = getAppSiteOrigin(
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com",
        process.env.NEXT_PUBLIC_APP_URL
    );
    const nextPath = safeNextPath(requestedNextPath);

    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        const isGoogleIdentity =
            user?.app_metadata.provider === "google" ||
            user?.identities?.some((identity) => identity.provider === "google");

        if (authError || !user || !isGoogleIdentity) {
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`, 303);
        }

        const admin = createAdminClient();
        const resolvedInvite = await resolveOAuthInviteParam(admin, user, inviteToken);
        const { data: existingUser, error: lookupError } = await admin
            .from("users")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

        if (lookupError) {
            logger.error({ err: lookupError }, "[Google Identity] User lookup failed:");
            Sentry.captureException(lookupError, {
                tags: { route: "google-identity-complete", step: "user_lookup" },
            });
            return NextResponse.redirect(`${origin}/login?error=setup_failed`, 303);
        }

        if (!existingUser) {
            return runOAuthNewUserSignup({
                admin,
                request,
                data: { user },
                appUrl,
                origin,
                inviteParamForAccept: resolvedInvite,
            });
        }

        await acceptBusinessInvitationAdmin({
            admin,
            userId: user.id,
            userEmail: user.email,
            inviteParam: resolvedInvite || null,
        });
        return NextResponse.redirect(`${appUrl}${nextPath}`, 303);
    } catch (error) {
        logger.error({ err: error }, "[Google Identity] Completion failed:");
        Sentry.captureException(error, {
            tags: { route: "google-identity-complete", step: "unhandled" },
        });
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`, 303);
    }
}
