import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { acceptBusinessInvitationAdmin } from "@/lib/auth/accept-business-invitation";
import type { Json } from "@/lib/db/supabase/database.types";
import {
    parseUtmFromRequest,
    resolveReferrerUserId,
    signUpPhoneFromUserMetadata,
    smsReviewAlertsConsentFromUserMetadata,
} from "./oauth-callback-helpers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { sendOAuthNewUserMessages } from "./oauth-new-user-messaging";
import { provisionDefaultWorkspace, workspaceSlug } from "./default-workspace";

export async function runOAuthNewUserSignup(params: {
    admin: SupabaseClient;
    request: Request;
    data: { user: User };
    appUrl: string;
    origin: string;
    inviteParamForAccept: string;
}): Promise<NextResponse> {
    const { admin, request, data, appUrl, origin, inviteParamForAccept } = params;
    // ─── NEW USER SIGNUP ────────────────────────────
    const fullName =
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "User";
    const email = data.user.email!;
    const slug = workspaceSlug(fullName);
    const signupPhone = signUpPhoneFromUserMetadata(data.user);
    const smsReviewAlertsConsent = smsReviewAlertsConsentFromUserMetadata(data.user);

    const { error: userError } = await admin.from("users").insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone: signupPhone,
    });

    if (userError) {
        logger.error({ err: userError }, "Failed to create user record:");
        Sentry.captureException(userError, { tags: { route: "auth-callback", step: "create_user" } });
        return NextResponse.redirect(`${origin}/login?error=setup_failed`);
    }

    const invited = await acceptBusinessInvitationAdmin({
        admin,
        userId: data.user.id,
        userEmail: data.user.email,
        inviteParam: inviteParamForAccept || null,
    });
    if (invited.accepted) {
        return NextResponse.redirect(`${appUrl}/`);
    }

    const referrerUserId = resolveReferrerUserId(request, data.user.id);
    let referredByUserId: string | null = null;
    if (referrerUserId) {
        const { data: referrerRow } = await admin
            .from("users")
            .select("id")
            .eq("id", referrerUserId)
            .maybeSingle();
        if (referrerRow?.id) {
            referredByUserId = referrerRow.id;
        }
    }

    const workspace = await provisionDefaultWorkspace(admin, {
        userId: data.user.id,
        fullName,
        referredByUserId,
        slug,
    });

    if (!workspace.ok) {
        logger.error({ err: workspace.error, step: workspace.step }, "Failed to set up new account workspace:");
        Sentry.captureException(workspace.error, { tags: { route: "auth-callback", step: workspace.step } });
        // The workspace rows were rolled back, but the users row stays: memberships reference
        // it, and an email user's next sign-in skips this callback, so onboarding finishes setup
        // (completeOnboardingWorkspaceSetup) on their next visit instead.
        return NextResponse.redirect(`${origin}/login?error=setup_failed`);
    }
    const org = { id: workspace.organizationId };
    const newBusiness = { id: workspace.businessId };

    if (signupPhone) {
        const { error: prefErr } = await admin.from("notification_preferences").upsert(
            {
                user_id: data.user.id,
                business_id: newBusiness.id,
                email_enabled: true,
                digest_enabled: true,
                sms_enabled: smsReviewAlertsConsent,
                sms_phone_number: smsReviewAlertsConsent ? signupPhone : null,
                email_frequency: "immediately",
                min_urgency_for_sms: 7,
                min_rating_threshold: 1,
                quiet_hours_start: "22:00:00",
                quiet_hours_end: "08:00:00",
            },
            { onConflict: "user_id,business_id" }
        );
        if (prefErr) {
            logger.error({ err: prefErr }, "Failed to seed notification preferences:");
            Sentry.captureException(prefErr, {
                tags: { route: "auth-callback", step: "seed_notification_preferences" },
            });
        }
    }

    if (referredByUserId) {
        const { error: referralPendingErr } = await admin.from("referral_conversions").insert({
            referrer_user_id: referredByUserId,
            referee_organization_id: org.id,
            referee_user_id: data.user.id,
            status: "pending",
        });
        if (referralPendingErr && referralPendingErr.code !== "23505") {
            logger.error({ err: referralPendingErr }, "[auth-callback] referral_conversions insert failed:");
        }
    }

    const signupUtm = parseUtmFromRequest(request);
    const signupMetadata = {
        email,
        full_name: fullName,
        ...(signupUtm ? { attribution: signupUtm, ...(signupUtm.ref ? { plg_ref: signupUtm.ref } : {}) } : {}),
        ...(referredByUserId ? { referred_by_user_id: referredByUserId } : {}),
    } as unknown as Json;

    await admin.from("events").insert({
        organization_id: org.id,
        user_id: data.user.id,
        event_type: "user.signed_up",
        entity_type: "user",
        entity_id: data.user.id,
        metadata: signupMetadata,
    });

    await sendOAuthNewUserMessages({
        email,
        fullName,
        userId: data.user.id,
        organizationId: org.id,
    });

    // New users go to onboarding on app subdomain
    const provider = data.user.app_metadata?.provider || data.user.identities?.[0]?.provider;
    const method = provider === "google" ? "google" : provider === "email" ? "email" : "other";
    return NextResponse.redirect(`${appUrl}/onboarding?new_signup=${method}`);
}
