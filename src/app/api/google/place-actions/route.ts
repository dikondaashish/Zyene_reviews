import { createClient } from "@/lib/supabase/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";
import { getValidGoogleToken } from "@/lib/google/sync-service";
import {
    createPlaceActionLink,
    deletePlaceActionLink,
    listAllPlaceActionTypeMetadata,
} from "@/lib/google/place-actions";
import { syncGbpPlaceActionsForPlatform } from "@/lib/google/phase2-sync";
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
        .select("id, google_location_id, platform")
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

        const meta = await listAllPlaceActionTypeMetadata(accessToken, platform.google_location_id);
        return NextResponse.json({ types: meta });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const businessId = body.businessId as string | undefined;
    const placeActionType = body.placeActionType as string | undefined;
    const uri = typeof body.uri === "string" ? body.uri.trim() : "";
    const isPreferred = Boolean(body.isPreferred);

    if (!businessId || !placeActionType || !uri) {
        return NextResponse.json(
            { error: "businessId, placeActionType, and uri are required" },
            { status: 400 }
        );
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

        await createPlaceActionLink(accessToken, platform.google_location_id, {
            placeActionType,
            uri,
            isPreferred,
        });
        await syncGbpPlaceActionsForPlatform(platform.id, { checkLinks: false });

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const linkId = body.linkId as string | undefined;
    if (!linkId) {
        return NextResponse.json({ error: "linkId required" }, { status: 400 });
    }

    const { data: row, error } = await supabase
        .from("gbp_place_action_links")
        .select("id, business_id, google_link_name, review_platform_id")
        .eq("id", linkId)
        .single();

    if (error || !row) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const allowed = await userCanAccessBusiness(supabase, user.id, row.business_id as string);
    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { accessToken } = await getValidGoogleToken(row.review_platform_id as string);
        if (!accessToken) {
            return NextResponse.json({ error: "Token unavailable" }, { status: 401 });
        }

        await deletePlaceActionLink(accessToken, row.google_link_name as string);
        await syncGbpPlaceActionsForPlatform(row.review_platform_id as string, { checkLinks: false });

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
