import { createClient } from "@/lib/supabase/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";
import { getValidGoogleToken } from "@/lib/google/sync-service";
import { getLodgingGoogleUpdated, stripLodgingOutputOnly } from "@/lib/google/lodging";
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

        const res = await getLodgingGoogleUpdated(accessToken, platform.google_location_id);
        return NextResponse.json({
            lodging: res.lodging ? stripLodgingOutputOnly(res.lodging as Record<string, unknown>) : null,
            diffMask: res.diffMask ?? null,
        });
    } catch (e: unknown) {
        const status = (e as Error & { statusCode?: number })?.statusCode;
        if (status === 404) {
            return NextResponse.json({
                error: "No lodging data or method unavailable for this location.",
            }, { status: 404 });
        }
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
