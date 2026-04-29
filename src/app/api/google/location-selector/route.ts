import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import {
    getValidGoogleToken,
    reattachOrphanedGoogleReviews,
    refreshGoogleReviewRollupsFromDb,
} from "@/services/google/sync-service";
import { listAccounts, listLocations } from "@/services/google/business-profile";
import { registerNotificationsWithRetry } from "@/services/google/notifications";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { redis } from "@/lib/db/redis";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";
import { z } from "zod";

const selectLocationSchema = z.object({
    businessId: z.string().uuid(),
    accountName: z.string().min(1).max(150).refine((v) => v.startsWith("accounts/"), {
        message: "accountName must be in accounts/{id} format",
    }),
    locationName: z.string().min(1).max(200),
});

function buildGoogleReviewUrl(location: { metadata?: { placeId?: string; newReviewUri?: string; mapsUri?: string } }) {
    if (location.metadata?.placeId) {
        return `https://search.google.com/local/writereview?placeid=${location.metadata.placeId}`;
    }
    return location.metadata?.newReviewUri || location.metadata?.mapsUri || null;
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

        const { data: platform, error: platErr } = await supabase
            .from("review_platforms")
            .select("id, platform, google_account_id, google_location_id, sync_status")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (platErr || !platform) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const accounts = await listAccounts(accessToken);
        const accountSummaries: Array<{
            resourceName: string;
            accountName: string;
            locations: Array<{ name: string; title: string; storeCode?: string | null }>;
        }> = [];

        for (const acc of accounts.slice(0, 8)) {
            const resourceName = acc.name; // accounts/{id}
            let locations: Array<{ name: string; title: string; storeCode?: string | null }> = [];
            try {
                const locs = await listLocations(accessToken, resourceName);
                locations = locs.map((l) => ({
                    name: l.name,
                    title: l.title || l.name,
                    storeCode: l.storeCode ?? null,
                }));
            } catch {
                locations = [];
            }
            accountSummaries.push({
                resourceName,
                accountName: acc.accountName || resourceName.replace(/^accounts\//, ""),
                locations: locations.slice(0, 50),
            });
        }

        return apiOk({
            accounts: accountSummaries,
            current: {
                googleAccountId: platform.google_account_id as string | null,
                googleLocationId: platform.google_location_id as string | null,
                syncStatus: platform.sync_status as string | null,
            },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const needsReconnect = /No refresh token available|reconnect/i.test(msg);
        if (needsReconnect) {
            return apiError("Authentication expired. Please reconnect Google.", {
                status: 401,
                code: "AUTH_EXPIRED",
            });
        }
        const normalized = toApiError(e);
        return apiError(normalized.message || msg, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await requireUser();
        const parsed = selectLocationSchema.safeParse(await request.json());
        if (!parsed.success) {
            return apiError(parsed.error.issues[0]?.message || "Invalid payload", { status: 400 });
        }

        const { businessId, accountName, locationName } = parsed.data;
        if (!businessId || !accountName || !locationName) {
            throw new ApiRouteError("businessId, accountName, and locationName required", {
                status: 400,
                code: "INVALID_PAYLOAD",
            });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error: platErr } = await supabase
            .from("review_platforms")
            .select("id, business_id, platform, google_location_id")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .maybeSingle();

        if (platErr || !platform) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const rawAccountId = accountName.replace(/^accounts\//, "");

        const locs = await listLocations(accessToken, accountName);
        const match = locs.find((l) => l.name === locationName || l.name.endsWith(`/${locationName}`));
        if (!match) {
            throw new ApiRouteError("Location not found for this account", {
                status: 404,
                code: "LOCATION_NOT_FOUND",
            });
        }

        const rawLocationId = match.name.split("/").pop() || null;
        const externalUrl = buildGoogleReviewUrl(match);

        const admin = createAdminClient();

        const previousLocationId = platform.google_location_id as string | null | undefined;
        const isSwitchingToDifferentLocation =
            previousLocationId != null &&
            previousLocationId !== "" &&
            rawLocationId != null &&
            rawLocationId !== previousLocationId;

        if (isSwitchingToDifferentLocation) {
            await admin.from("reviews").delete().eq("business_id", platform.business_id).eq("platform", "google");
            await admin
                .from("businesses")
                .update({ total_reviews: 0, average_rating: 0, updated_at: new Date().toISOString() })
                .eq("id", platform.business_id);
            await admin
                .from("review_platforms")
                .update({
                    google_account_id: rawAccountId,
                    google_location_id: rawLocationId,
                    external_id: rawLocationId,
                    external_url: externalUrl,
                    total_reviews: 0,
                    average_rating: 0,
                    last_synced_at: null,
                    sync_status: "active",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", platform.id);
        } else {
            await reattachOrphanedGoogleReviews(admin, platform.business_id, platform.id);
            await admin
                .from("review_platforms")
                .update({
                    google_account_id: rawAccountId,
                    google_location_id: rawLocationId,
                    external_id: rawLocationId,
                    external_url: externalUrl,
                    sync_status: "active",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", platform.id);
            await refreshGoogleReviewRollupsFromDb(admin, platform.business_id, platform.id);
        }

        // Register Pub/Sub notifications now that we know the account (non-fatal).
        const topicName = process.env.GOOGLE_PUBSUB_TOPIC_NAME;
        if (topicName) {
            await registerNotificationsWithRetry({
                accessToken,
                accountName,
                topic: topicName,
                platformId: platform.id,
                googleAccountId: rawAccountId,
                logPrefix: "[Location Selector]",
            });
        }

        // Bust cached business context so UI updates immediately.
        try {
            await redis.del(`user_businesses:${user.id}`);
        } catch (e) {
            console.error("[Location Selector] Failed to clear business cache:", e);
        }

        return apiOk({
            success: true,
            googleAccountId: rawAccountId,
            googleLocationId: rawLocationId,
            externalUrl,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const needsReconnect = /No refresh token available|reconnect/i.test(msg);
        if (needsReconnect) {
            return apiError("Authentication expired. Please reconnect Google.", {
                status: 401,
                code: "AUTH_EXPIRED",
            });
        }
        const normalized = toApiError(e);
        return apiError(normalized.message || msg, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}

