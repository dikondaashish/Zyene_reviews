import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { nanoid } from "nanoid";
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
    const slug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;
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

    const { data: org, error: orgError } = await admin
        .from("organizations")
        .insert({
            name: `${fullName}'s Org`,
            slug: slug,
            type: "business",
            referred_by_user_id: referredByUserId,
        })
        .select()
        .single();

    if (orgError) {
        logger.error({ err: orgError }, "Failed to create organization:");
        Sentry.captureException(orgError, { tags: { route: "auth-callback", step: "create_organization" } });
        return NextResponse.redirect(`${origin}/login?error=setup_failed`);
    }

    const { data: newBusiness, error: newBizError } = await admin
        .from("businesses")
        .insert({
            organization_id: org.id,
            name: `${fullName}'s Business`,
            slug: org.slug,
            country: "US",
            timezone: "UTC",
            category: "uncategorized",
            status: "active",
        })
        .select("id")
        .single();

    if (newBizError || !newBusiness) {
        logger.error({ err: newBizError }, "Failed to create default business:");
        Sentry.captureException(newBizError ?? new Error("missing business id"), {
            tags: { route: "auth-callback", step: "create_business" },
        });
        return NextResponse.redirect(`${origin}/login?error=setup_failed`);
    }

    await admin.from("business_members").upsert(
        {
            business_id: newBusiness.id,
            user_id: data.user.id,
            role: "owner",
            status: "active",
        },
        { onConflict: "business_id,user_id" }
    );

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

    await admin.from("organization_members").insert({
        organization_id: org.id,
        user_id: data.user.id,
        role: "ORG_OWNER",
        status: "active",
    });

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

    const { sendEmail } = await import("@/services/resend/send-email");
    const { welcomeEmail, welcomeEmailText } = await import("@/services/resend/templates/welcome-email");
    const loginUrl = `${appUrl}/login`;

    sendEmail({
        to: email,
        subject: "Welcome to Zyene Reviews — connect Google to get started",
        html: welcomeEmail({ userName: fullName || "User", loginUrl }),
        text: welcomeEmailText({ userName: fullName || "User", loginUrl }),
    }).catch(err => {
        logger.error({ err: err }, "Failed to send welcome email:");
        Sentry.captureException(err, { tags: { route: "auth-callback", step: "send_welcome_email" } });
    });

    try {
        const { scheduleTrialNurture } = await import("@/lib/growth/schedule-growth-emails");
        await scheduleTrialNurture({
            email,
            userName: fullName || "there",
            userId: data.user.id,
            organizationId: org.id,
        });
    } catch (nurtureErr) {
        logger.error({ err: nurtureErr }, "Failed to schedule trial nurture:");
        Sentry.captureException(nurtureErr, { tags: { route: "auth-callback", step: "schedule_trial_nurture" } });
    }

    // New users go to onboarding on app subdomain
    return NextResponse.redirect(`${appUrl}/onboarding`);
}
