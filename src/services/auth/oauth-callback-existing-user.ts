import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { acceptBusinessInvitationAdmin } from "@/lib/auth/accept-business-invitation";
import {
    reattachOrphanedGoogleReviews,
    refreshGoogleReviewRollupsFromDb,
} from "@/services/google/sync-service";
import { redis } from "@/lib/db/redis";
import type { AuthMemberOrgContext, GooglePlatformUpdatePayload } from "@/types/api-routes";
import { inngest } from "@/services/inngest/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

export async function runOAuthExistingUserLogin(params: {
    admin: SupabaseClient;
    data: { user: User; session: Session | null };
    appUrl: string;
    next: string;
    biz: string | null;
    inviteParamForAccept: string;
}): Promise<NextResponse> {
    const { admin, data, appUrl, next, biz, inviteParamForAccept } = params;
    const invited = await acceptBusinessInvitationAdmin({
    admin,
    userId: data.user.id,
    userEmail: data.user.email,
    inviteParam: inviteParamForAccept || null,
    });
    if (invited.accepted) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
    }

    const isGoogle = data.user.app_metadata.provider === 'google' ||
    data.user.identities?.some(id => id.provider === 'google');

    if (isGoogle) {
    const finalAccessToken = data.session?.provider_token;
    const finalRefreshToken = data.session?.provider_refresh_token;

    // Prefer explicit business id from the OAuth redirect (biz=...).
    // Fallback to the first business in the user’s org membership.
    let businessId: string | null = null;
    if (biz) {
        const { data: bizRow, error: bizErr } = await admin
            .from("businesses")
            .select(`id, organizations!inner(organization_members!inner(user_id))`)
            .eq("id", biz)
            .eq("organizations.organization_members.user_id", data.user.id)
            .single();
        if (!bizErr && bizRow?.id) {
            businessId = bizRow.id;
        }
    }

    if (!businessId) {
        const { data: memberData } = await admin
            .from("organization_members")
            .select(`organizations ( businesses (id) )`)
            .eq("user_id", data.user.id)
            .maybeSingle();

        businessId =
            (memberData as unknown as AuthMemberOrgContext)?.organizations?.businesses?.[0]?.id ?? null;
    }

    if (businessId) {
        const { data: platformData } = await admin
            .from("review_platforms")
            .select("id")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .single();

        if (!finalRefreshToken) {
            logger.warn(
                { businessId },
                "[Auth Callback] Google OAuth omitted refresh_token — existing refresh preserved on update"
            );
        }

        const { data: encAccess, error: encAccessError } = await admin.rpc("encrypt_token", {
            plaintext: finalAccessToken || "",
        });
        if (encAccessError) {
            logger.error({ err: encAccessError }, "[Auth Callback] access token encryption failed:");
        }

        let encRefresh: string | null = null;
        if (finalRefreshToken) {
            const { data, error: encRefreshError } = await admin.rpc("encrypt_token", {
                plaintext: finalRefreshToken,
            });
            if (encRefreshError) {
                logger.error({ err: encRefreshError }, "[Auth Callback] refresh token encryption failed:");
            } else {
                encRefresh = data;
            }
        }

        if (platformData) {
            const updatePayload: GooglePlatformUpdatePayload = {
                sync_status: "active",
                updated_at: new Date().toISOString(),
            };
            if (encAccess) updatePayload.access_token = encAccess;
            // Only update refresh when Google returns one. Location is selected later.
            if (finalRefreshToken && encRefresh) updatePayload.refresh_token = encRefresh;

            await admin.from("review_platforms").update(updatePayload).eq("id", platformData.id);
        } else if (encAccess) {
            const { data: newPlatform, error: insPlatErr } = await admin
                .from("review_platforms")
                .insert({
                    business_id: businessId,
                    platform: "google",
                    sync_status: "active",
                    total_reviews: 0,
                    average_rating: 0,
                    access_token: encAccess,
                    refresh_token: encRefresh,
                    google_account_id: null,
                    google_location_id: null,
                    external_id: null,
                    external_url: null,
                })
                .select("id")
                .single();

            if (insPlatErr) {
                logger.error({ err: insPlatErr }, "[Auth Callback] review_platforms insert failed:");
            } else if (newPlatform?.id) {
                await reattachOrphanedGoogleReviews(admin, businessId, newPlatform.id);
                await refreshGoogleReviewRollupsFromDb(admin, businessId, newPlatform.id);
                try {
                    await inngest.send({
                        name: "google-seo-aeo/sync.run",
                        data: { businessId, trigger: "onboarding" },
                    });
                } catch (e) {
                    logger.error({ err: e }, "[Auth Callback] Failed to queue Google SEO/AEO sync:");
                }
            }
        }

        // Notifications are registered after the user selects the correct GBP location/account.

        // Clear cached business context so the integrations UI immediately reflects "Connected".
        try {
            await redis.del(`user_businesses:${data.user.id}`);
        } catch (e) {
            logger.error({ err: e }, "[Auth Callback] Failed to clear business cache:");
        }
    }
    }

    // Preserve the caller intent (e.g. integrations page -> /integrations).
    return NextResponse.redirect(`${appUrl}${next}`);
}
