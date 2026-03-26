import { createClient } from "@/lib/supabase/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";
import { getValidGoogleToken } from "@/lib/google/sync-service";
import {
    getGoogleLocation,
    patchGoogleLocation,
    type PatchListingInput,
} from "@/lib/google/listing-information";
import { computeProfileHealth } from "@/lib/google/profile-health";
import { syncGoogleListingProfileForPlatform } from "@/lib/google/phase3-sync";
import { type NextRequest, NextResponse } from "next/server";

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
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = request.nextUrl.searchParams.get("businessId");
    if (!businessId) {
        return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: platform, error } = await supabase
        .from("review_platforms")
        .select("id, google_location_id, platform, google_profile_health_score, google_listing_synced_at")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("sync_status", "active")
        .maybeSingle();

    if (error || !platform?.google_location_id) {
        return NextResponse.json({ error: "Google not connected" }, { status: 404 });
    }

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            return NextResponse.json({ error: "Token unavailable" }, { status: 401 });
        }

        const loc = await getGoogleLocation(accessToken, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        return NextResponse.json({
            listing: publicListingPayload(loc),
            profileHealth,
            cachedScore: platform.google_profile_health_score,
            lastSyncedAt: platform.google_listing_synced_at,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
        businessId?: string;
        title?: string;
        websiteUri?: string;
        primaryPhone?: string;
        description?: string;
    };

    const businessId = body.businessId;
    if (!businessId) {
        return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: platform, error } = await supabase
        .from("review_platforms")
        .select("id, google_location_id, platform")
        .eq("business_id", businessId)
        .eq("platform", "google")
        .eq("sync_status", "active")
        .maybeSingle();

    if (error || !platform?.google_location_id) {
        return NextResponse.json({ error: "Google not connected" }, { status: 404 });
    }

    const requested =
        body.title !== undefined ||
        body.websiteUri !== undefined ||
        body.primaryPhone !== undefined ||
        body.description !== undefined;
    if (!requested) {
        return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const input: PatchListingInput = {};
    if (typeof body.title === "string") {
        const t = body.title.trim();
        if (!t) {
            return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
        }
        input.title = t;
    }
    if (typeof body.websiteUri === "string") {
        const w = body.websiteUri.trim();
        if (w) {
            if (!/^https?:\/\//i.test(w)) {
                return NextResponse.json(
                    { error: "Website must start with http:// or https://" },
                    { status: 400 }
                );
            }
            input.websiteUri = w;
        }
    }
    if (typeof body.primaryPhone === "string") {
        const p = body.primaryPhone.trim();
        if (p) {
            input.primaryPhone = p;
        }
    }
    if (typeof body.description === "string") {
        input.description = body.description.trim();
    }

    if (Object.keys(input).length === 0) {
        return NextResponse.json(
            { error: "No valid fields to update (empty values are ignored)" },
            { status: 400 }
        );
    }

    try {
        const { accessToken } = await getValidGoogleToken(platform.id);
        if (!accessToken) {
            return NextResponse.json({ error: "Token unavailable" }, { status: 401 });
        }

        await patchGoogleLocation(accessToken, platform.google_location_id, input);
        await syncGoogleListingProfileForPlatform(platform.id);

        const { accessToken: token2 } = await getValidGoogleToken(platform.id);
        if (!token2) {
            return NextResponse.json({ success: true });
        }
        const loc = await getGoogleLocation(token2, platform.google_location_id);
        const profileHealth = computeProfileHealth(loc);

        return NextResponse.json({
            success: true,
            listing: publicListingPayload(loc),
            profileHealth,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
