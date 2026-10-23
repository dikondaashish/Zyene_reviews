import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    lookupCompetitorSuggestions,
    ownPlaceIdFromUrls,
    SUGGESTIONS_SHOWN,
    withoutTracked,
} from "@/lib/competitors/competitor-suggestions";
import type { CompetitorSuggestionsResponse } from "@/lib/competitors/competitor-suggestion-types";

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

/** Nearby businesses like the active one that it does not track yet (see competitor-suggestions.ts). */
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { businessId, business } = await getActiveBusinessId();
        if (!businessId || !business) return NextResponse.json({ error: "No active business" }, { status: 400 });

        const google = business.review_platforms?.find((p) => p.platform === "google");
        const name = text(business.name) ?? "";
        const placeId = ownPlaceIdFromUrls([text(business.google_review_url), text(google?.external_url)]);

        const [lookup, trackedRes] = await Promise.all([
            lookupCompetitorSuggestions({ businessId, name, city: text(business.city), placeId }),
            supabase.from("competitors").select("name, google_url").eq("business_id", businessId),
        ]);
        if (trackedRes.error) throw trackedRes.error;

        const body: CompetitorSuggestionsResponse = lookup.status === "ok"
            ? { suggestions: withoutTracked(lookup.suggestions, trackedRes.data ?? [], { name, placeId }).slice(0, SUGGESTIONS_SHOWN) }
            : { suggestions: [], reason: lookup.status };
        return NextResponse.json(body, { headers: { "Cache-Control": "private, no-store" } });
    } catch (err) {
        logger.error({ err }, "GET /api/competitors/suggestions failed");
        return NextResponse.json({ error: "Could not load suggestions" }, { status: 500 });
    }
}
