import { logger } from "@/lib/logger";
import { nanoid } from "nanoid";
import * as Sentry from "@sentry/nextjs";
import { inngest } from "@/services/inngest/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { OAuthAddBusinessGbpDetails } from "./oauth-callback-add-business-gbp";
import { fetchGoogleGrantedScopes } from "@/services/google/verify-granted-scopes";

export async function createOAuthAddBusinessRecord(params: {
    admin: SupabaseClient;
    addBusinessOrgId: string;
    user: User;
    gbp: OAuthAddBusinessGbpDetails;
    finalAccessToken: string | undefined;
    finalRefreshToken: string | undefined;
}): Promise<void> {
    const { admin, addBusinessOrgId, user, gbp, finalAccessToken, finalRefreshToken } = params;

    const newBizName = gbp.locationName || `${user.user_metadata?.full_name || "New"}'s Business`;
    const newBizSlug = `${newBizName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;
    const supportEmail = user.email || null;

    const { data: newBusiness, error: newBizError } = await admin
        .from("businesses")
        .insert({
            organization_id: addBusinessOrgId,
            name: newBizName,
            slug: newBizSlug,
            country: "US",
            timezone: "UTC",
            category: gbp.bizCategory,
            status: "active",
            google_review_url: gbp.googleReviewUrl,
            email: supportEmail,
            phone: gbp.bizPhone,
            address_line1: gbp.bizAddress,
            city: gbp.bizCity,
            state: gbp.bizState,
            zip: gbp.bizZip,
            website: gbp.bizWebsite,
        })
        .select("id")
        .single();

    if (newBizError) {
        logger.error({ err: newBizError }, "Failed to create new business:");
        Sentry.captureException(newBizError, { tags: { route: "auth-callback", step: "create_new_business" } });
        return;
    }

    if (!newBusiness) return;

    const [{ data: encAccess }, { data: encRefresh }, grantedScopes] = await Promise.all([
        admin.rpc("encrypt_token", { plaintext: finalAccessToken || "" }),
        admin.rpc("encrypt_token", { plaintext: finalRefreshToken || "" }),
        finalAccessToken ? fetchGoogleGrantedScopes(finalAccessToken) : Promise.resolve(null),
    ]);

    await admin.from("review_platforms").insert({
        business_id: newBusiness.id,
        platform: "google",
        sync_status: "active",
        access_token: encAccess,
        refresh_token: encRefresh,
        google_account_id: gbp.googleAccountId,
        google_location_id: gbp.googleLocationId,
        external_id: gbp.externalId,
        external_url: gbp.googleReviewUrl,
        total_reviews: 0,
        average_rating: 0,
        ...(grantedScopes ? { granted_scopes: grantedScopes } : {}),
    });

    await admin.from("business_members").upsert(
        {
            business_id: newBusiness.id,
            user_id: user.id,
            role: "owner",
            status: "active",
        },
        { onConflict: "business_id,user_id" },
    );

    try {
        await inngest.send({
            name: "google-seo-aeo/sync.run",
            data: { businessId: newBusiness.id, trigger: "onboarding" },
        });
    } catch (e) {
        logger.error({ err: e }, "[Auth Callback] Failed to queue Google SEO/AEO sync:");
    }
}
