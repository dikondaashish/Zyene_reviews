import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { businessPlaceSearchRateLimit } from "@/lib/auth/rate-limit";
import { searchBusinessPlaces } from "@/services/places/places-business-search";

export const dynamic = "force-dynamic";

const querySchema = z.string().trim().min(3).max(120);
const countrySchema = z.string().regex(/^[A-Z]{2}$/).catch("US");

/** Onboarding: find the owner's business on Google so name, address, city and state fill in at once. */
export async function GET(request: NextRequest) {
    const parsed = querySchema.safeParse(request.nextUrl.searchParams.get("q") ?? "");
    if (!parsed.success) return NextResponse.json({ matches: [] });

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { success } = await businessPlaceSearchRateLimit.limit(user.id);
        if (!success) return NextResponse.json({ error: "Too many searches. Type the details in instead." }, { status: 429 });

        const country = countrySchema.parse(request.nextUrl.searchParams.get("country") ?? "US");
        return NextResponse.json({ matches: await searchBusinessPlaces(parsed.data, country) });
    } catch (err) {
        logger.error({ err }, "[places/business-search]");
        return NextResponse.json({ error: "Search is unavailable right now." }, { status: 503 });
    }
}
