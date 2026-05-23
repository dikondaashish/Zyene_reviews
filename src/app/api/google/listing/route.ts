import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import {
    getGoogleLocation,
    patchGoogleLocation,
    type PatchListingInput,
} from "@/services/google/listing-information";
import { computeProfileHealth } from "@/services/google/profile-health";
import { syncGoogleListingProfileForPlatform } from "@/services/google/phase3-sync";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { z } from "zod";
import { createRequestLogger, logger } from "@/lib/logger";

const patchListingSchema = z.object({
    businessId: z.string().uuid(),
    title: z.string().trim().min(1).max(200).optional(),
    websiteUri: z.string().trim().max(500).optional(),
    primaryPhone: z.string().trim().max(30).optional(),
    description: z.string().max(2000).optional(),
}).superRefine((value, ctx) => {
    const hasField =
        value.title !== undefined ||
        value.websiteUri !== undefined ||
        value.primaryPhone !== undefined ||
        value.description !== undefined;

    if (!hasField) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "No updatable fields provided",
        });
    }
});

function publicListingPayload(loc: Awaited<ReturnType<typeof getGoogleLocation>>) {
    return {
        title: loc.title ?? "",
        websiteUri: loc.websiteUri ?? "",
        primaryPhone: loc.phoneNumbers?.primaryPhone ?? "",
        description: loc.profile?.description ?? "",
        primaryCategoryDisplay: loc.categories?.primaryCategory?.displayName ?? "",
        addressLines: loc.storefrontAddress?.addressLines ?? [],
        locality: loc.storefrontAddress?.locality ?? "",
        administrativeArea: loc.storefrontAddress?.administrativeArea ?? "",
        postalCode: loc.storefrontAddress?.postalCode ?? "",
        mapsUri: loc.metadata?.mapsUri ?? "",
        newReviewUri: loc.metadata?.newReviewUri ?? "",
        hasRegularHours: !!(loc.regularHours?.periods && loc.regularHours.periods.length > 0),
    };
}

export async function GET(request: NextRequest) {
    try {
        const { supabase, user } = await requireUser();
        const businessId = request.nextUrl.searchParams.get("businessId");
        if (!businessId) {
            throw new ApiRouteError("businessId required", { status: 400, code: "MISSING_BUSINESS_ID" });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_location_id, platform, google_profile_health_score, google_listing_synced_at")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const loc = await getGoogleLocation(accessToken, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        // Persist the fetched Google data back to the businesses table
        // so Business Information form stays in sync
        try {
            await supabase
                .from("businesses")
                .update({
                    phone: loc.phoneNumbers?.primaryPhone || null,
                    address_line1: loc.storefrontAddress?.addressLines?.join(", ") || null,
                    city: loc.storefrontAddress?.locality || null,
                    state: loc.storefrontAddress?.administrativeArea || null,
                    zip: loc.storefrontAddress?.postalCode || null,
                    website: loc.websiteUri || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", businessId);
        } catch (persistErr) {
            // Non-fatal: log but don't fail the reload
            logger.error({ err: persistErr }, "[Google Listing] Failed to persist data to businesses table:");
        }

        // Also trigger the background listing profile sync to update health score
        syncGoogleListingProfileForPlatform(platform.id).catch((err) =>
            logger.error({ err }, "[Google Listing] background profile sync failed"),
        );

        return apiOk({
            listing: publicListingPayload(loc),
            profileHealth,
            cachedScore: platform.google_profile_health_score,
            lastSyncedAt: platform.google_listing_synced_at,
        });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}

export async function PATCH(request: Request) {
    try {
        const { requestId } = createRequestLogger("PATCH /api/google/listing");
        const { supabase, user } = await requireUser();
        const parsed = patchListingSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0]?.message || "Invalid payload", { status: 400, details: requestId });
        }

        const { businessId, title, websiteUri, primaryPhone, description } = parsed.data;

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_location_id, platform")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const requested =
            title !== undefined ||
            websiteUri !== undefined ||
            primaryPhone !== undefined ||
            description !== undefined;
        if (!requested) {
            throw new ApiRouteError("No updatable fields provided", { status: 400, code: "NO_FIELDS" });
        }

        const input: PatchListingInput = {};
        if (typeof title === "string") {
            const t = title.trim();
            if (!t) {
                throw new ApiRouteError("Title cannot be empty", { status: 400, code: "INVALID_TITLE" });
            }
            input.title = t;
        }
        if (typeof websiteUri === "string") {
            const w = websiteUri.trim();
            if (w) {
                if (!/^https?:\/\//i.test(w)) {
                    throw new ApiRouteError("Website must start with http:// or https://", {
                        status: 400,
                        code: "INVALID_WEBSITE",
                    });
                }
                input.websiteUri = w;
            }
        }
        if (typeof primaryPhone === "string") {
            const p = primaryPhone.trim();
            if (p) {
                input.primaryPhone = p;
            }
        }
        if (typeof description === "string") {
            input.description = description.trim();
        }

        if (Object.keys(input).length === 0) {
            throw new ApiRouteError("No valid fields to update (empty values are ignored)", {
                status: 400,
                code: "NO_VALID_FIELDS",
            });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        await patchGoogleLocation(accessToken, platform.google_location_id, input);
        await syncGoogleListingProfileForPlatform(platform.id);

        const { accessToken: token2 } = await getValidGoogleToken(platform.id);
        if (!token2) {
            return apiOk({ success: true });
        }
        const loc = await getGoogleLocation(token2, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        return apiOk({
            success: true,
            listing: publicListingPayload(loc),
            profileHealth,
        });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
