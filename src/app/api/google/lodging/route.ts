import { createClient } from "@/lib/supabase/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";
import { getValidGoogleToken } from "@/lib/google/sync-service";
import { getLodging, patchLodging, stripLodgingOutputOnly, type LodgingRecord } from "@/lib/google/lodging";
import { mergeLodgingPatches, type LodgingPatches } from "@/lib/google/lodging-merge";
import { computeLodgingHealth } from "@/lib/google/lodging-health";
import { syncGoogleLodgingForPlatform } from "@/lib/google/phase4-sync";
import { type NextRequest, NextResponse } from "next/server";

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
        .select(
            "id, google_location_id, platform, google_lodging_synced_at, google_lodging_health_score, google_lodging_available"
        )
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

        const lodging = await getLodging(accessToken, platform.google_location_id);
        const healthScore = computeLodgingHealth(lodging);
        const publicLodging = stripLodgingOutputOnly(lodging) as LodgingRecord;

        return NextResponse.json({
            available: true,
            lodging: publicLodging,
            healthScore,
            cached: {
                syncedAt: platform.google_lodging_synced_at,
                healthScore: platform.google_lodging_health_score,
                lodgingAvailable: platform.google_lodging_available,
            },
        });
    } catch (e: unknown) {
        const status = (e as Error & { statusCode?: number })?.statusCode;
        if (status === 404 || (e instanceof Error && /\b404\b/i.test(e.message))) {
            return NextResponse.json({
                available: false,
                message:
                    "Google has no lodging record for this location. Lodging API applies to hotels and similar categories.",
            });
        }
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

    const body = (await request.json()) as { businessId?: string; patches?: LodgingPatches };
    const businessId = body.businessId;
    const patches = body.patches;

    if (!businessId || !patches || typeof patches !== "object") {
        return NextResponse.json({ error: "businessId and patches required" }, { status: 400 });
    }

    const allowed = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: platform, error } = await supabase
        .from("review_platforms")
        .select("id, google_location_id")
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

        const current = await getLodging(accessToken, platform.google_location_id);
        const { body: merged, updateMask } = mergeLodgingPatches(current, patches);
        const updated = await patchLodging(accessToken, platform.google_location_id, merged, updateMask);
        await syncGoogleLodgingForPlatform(platform.id);

        const publicLodging = stripLodgingOutputOnly(updated) as LodgingRecord;
        return NextResponse.json({
            success: true,
            lodging: publicLodging,
            healthScore: computeLodgingHealth(updated),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
