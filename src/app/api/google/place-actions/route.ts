import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import {
    createPlaceActionLink,
    deletePlaceActionLink,
    listAllPlaceActionTypeMetadata,
} from "@/services/google/place-actions";
import { syncGbpPlaceActionsForPlatform } from "@/services/google/phase2-sync";
import { type NextRequest } from "next/server";
import { ApiRouteError, toApiError } from "@/app/api/_shared/errors";
import { requireUser } from "@/app/api/_shared/auth";
import { apiError, apiOk } from "@/app/api/_shared/responses";

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
            .select("id, google_location_id, platform")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .eq("sync_status", "active")
            .maybeSingle();

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        const meta = await listAllPlaceActionTypeMetadata(accessToken, platform.google_location_id);
        return apiOk({ types: meta });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}

export async function POST(request: Request) {
    try {
        const { supabase, user } = await requireUser();
        const body = await request.json();
        const businessId = body.businessId as string | undefined;
        const placeActionType = body.placeActionType as string | undefined;
        const uri = typeof body.uri === "string" ? body.uri.trim() : "";
        const isPreferred = Boolean(body.isPreferred);

        if (!businessId || !placeActionType || !uri) {
            throw new ApiRouteError("businessId, placeActionType, and uri are required", {
                status: 400,
                code: "INVALID_PAYLOAD",
            });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .select("id, google_location_id")
            .eq("business_id", businessId)
            .eq("platform", "google")
            .eq("sync_status", "active")
            .maybeSingle();

        if (error || !platform?.google_location_id) {
            throw new ApiRouteError("Google not connected", { status: 404, code: "GOOGLE_NOT_CONNECTED" });
        }

        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        await createPlaceActionLink(accessToken, platform.google_location_id, {
            placeActionType,
            uri,
            isPreferred,
        });
        await syncGbpPlaceActionsForPlatform(platform.id, { checkLinks: false });

        return apiOk({ success: true });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}

export async function DELETE(request: Request) {
    try {
        const { supabase, user } = await requireUser();
        const body = await request.json();
        const linkId = body.linkId as string | undefined;
        if (!linkId) {
            throw new ApiRouteError("linkId required", { status: 400, code: "MISSING_LINK_ID" });
        }

        const { data: row, error } = await supabase
            .from("gbp_place_action_links")
            .select("id, business_id, google_link_name, review_platform_id")
            .eq("id", linkId)
            .single();

        if (error || !row) {
            throw new ApiRouteError("Link not found", { status: 404, code: "LINK_NOT_FOUND" });
        }

        const allowed = await userCanAccessBusiness(supabase, user.id, row.business_id as string);
        if (!allowed) {
            throw new ApiRouteError("Forbidden", { status: 403, code: "FORBIDDEN" });
        }

        const { accessToken } = await getValidGoogleToken(row.review_platform_id as string);
        if (!accessToken) {
            throw new ApiRouteError("Token unavailable", { status: 401, code: "TOKEN_UNAVAILABLE" });
        }

        await deletePlaceActionLink(accessToken, row.google_link_name as string);
        await syncGbpPlaceActionsForPlatform(row.review_platform_id as string, { checkLinks: false });

        return apiOk({ success: true });
    } catch (e: unknown) {
        const normalized = toApiError(e);
        return apiError(normalized.message, {
            status: normalized.status || 400,
            code: normalized.code,
            details: normalized.details,
        });
    }
}
