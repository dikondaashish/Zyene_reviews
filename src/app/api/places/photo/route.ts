import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { businessPlaceSearchRateLimit } from "@/lib/auth/rate-limit";
import { fetchPlacePhotoUrl, isPlacePhotoName } from "@/services/places/places-business-search";

export const dynamic = "force-dynamic";

/** Onboarding preview: the business's Google photo, once the owner picks their business. */
export async function GET(request: NextRequest) {
    const name = request.nextUrl.searchParams.get("name") ?? "";
    if (!isPlacePhotoName(name)) return NextResponse.json({ error: "Invalid photo" }, { status: 400 });

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { success } = await businessPlaceSearchRateLimit.limit(user.id);
        if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

        return NextResponse.json({ url: await fetchPlacePhotoUrl(name) });
    } catch (err) {
        logger.error({ err }, "[places/photo]");
        return NextResponse.json({ url: null }, { status: 503 });
    }
}
