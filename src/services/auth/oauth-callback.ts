import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { safeNextPath } from "./oauth-callback-helpers";
import { runOAuthAddBusinessFlow } from "./oauth-callback-add-business";
import { runOAuthNewUserSignup } from "./oauth-callback-new-user";
import { runOAuthExistingUserLogin } from "./oauth-callback-existing-user";
import { resolveOAuthInviteParam } from "./oauth-invite";
import { getAppSiteOrigin } from "@/lib/routing/platform-routes";
import { consumeAddBusinessOAuth } from "./add-business-oauth-cookie";
import { canAddBusinessToOrganization } from "./add-business-authorization";

export async function handleOAuthCallback(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const appUrl = getAppSiteOrigin(
            process.env.NEXT_PUBLIC_ROOT_DOMAIN || "zyenereviews.com",
            process.env.NEXT_PUBLIC_APP_URL
        );
        const code = searchParams.get("code");
        const next = safeNextPath(searchParams.get("next"));
        const biz = searchParams.get("biz");
        const addBusinessState = searchParams.get("add_business_state");
        const hasLegacyAddBusinessIds = searchParams.has("add_org") || searchParams.has("add_user");

        if (!code || hasLegacyAddBusinessIds) {
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
        }

        const supabase = await createClient();
        let originalUserId: string | null = null;
        let addBusinessOrgId: string | null = null;
        if (addBusinessState) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || next !== "/businesses") {
                return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
            }

            const state = await consumeAddBusinessOAuth(addBusinessState, user.id);
            if (!state || !await canAddBusinessToOrganization(
                supabase, user.id, state.organizationId,
            )) {
                return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
            }
            originalUserId = user.id;
            addBusinessOrgId = state.organizationId;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user) {
            const errMessage = (error as { message?: string } | null)?.message;
            const safeMessage =
                typeof errMessage === "string"
                    ? errMessage.replace(/external code[^:]*:\s*[^\\s]+/i, "external code: <redacted>")
                    : "No user returned from exchangeCodeForSession";
            Sentry.captureException(new Error(safeMessage), {
                tags: { route: "auth-callback", step: "exchangeCodeForSession" },
            });
            return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
        }

        if (data.user) {
            const admin = createAdminClient();
            if (originalUserId && addBusinessOrgId) {
                return runOAuthAddBusinessFlow({
                    admin,
                    supabase,
                    data,
                    appUrl,
                    addBusinessOrgId,
                    originalUserId,
                });
            }

            const inviteParamForAccept = await resolveOAuthInviteParam(
                admin,
                data.user,
                searchParams.get("invite")
            );

            const { data: existingUser } = await admin
                .from("users")
                .select("id")
                .eq("id", data.user.id)
                .single();

            if (!existingUser) {
                return runOAuthNewUserSignup({
                    admin,
                    request,
                    data,
                    appUrl,
                    origin,
                    inviteParamForAccept,
                });
            }

            return runOAuthExistingUserLogin({
                admin,
                data,
                appUrl,
                next,
                biz,
                inviteParamForAccept,
            });
        }
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    } catch (error) {
        Sentry.captureException(error, { tags: { route: "auth-callback", step: "unhandled" } });
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
}
