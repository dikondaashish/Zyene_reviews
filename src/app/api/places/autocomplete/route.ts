import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

export type PlacesAutocompleteSuggestion = {
    placeId: string;
    primaryText: string;
    secondaryText: string;
    mapsUrl: string;
};

/**
 * Google Places Autocomplete (New) — server-side only; API key never sent to the browser.
 * GET ?q=...&region=us (optional 2-letter regionCode for biasing/formatting)
 */
export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] as PlacesAutocompleteSuggestion[] });
    }

    const apiKey =
        process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
    if (!apiKey) {
        logger.error("[places/autocomplete] Missing GOOGLE_MAPS_API_KEY / GOOGLE_API_KEY");
        return NextResponse.json({ error: "Places search is not configured" }, { status: 503 });
    }

    const regionParam = request.nextUrl.searchParams.get("region")?.trim().toLowerCase();
    const regionCode =
        regionParam && regionParam.length === 2 ? regionParam : undefined;

    const body: Record<string, unknown> = {
        input: q,
        languageCode: "en",
    };
    if (regionCode) {
        body.regionCode = regionCode;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask":
                    "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const text = await response.text();
            logger.error(
                { status: response.status, body: text.slice(0, 400) },
                "[places/autocomplete] Google error",
            );
            return NextResponse.json({ error: "Search failed" }, { status: 502 });
        }

        const data = (await response.json()) as {
            suggestions?: Array<{
                placePrediction?: {
                    placeId?: string;
                    text?: { text?: string };
                    structuredFormat?: {
                        mainText?: { text?: string };
                        secondaryText?: { text?: string };
                    };
                };
            }>;
        };

        const suggestions: PlacesAutocompleteSuggestion[] = (data.suggestions ?? [])
            .map((s) => s.placePrediction)
            .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
            .map((p) => {
                const placeId = String(p.placeId);
                const primary =
                    p.structuredFormat?.mainText?.text?.trim() ||
                    p.text?.text?.split(",")[0]?.trim() ||
                    "";
                const secondary =
                    p.structuredFormat?.secondaryText?.text?.trim() ||
                    (primary && p.text?.text?.startsWith(primary)
                        ? p.text.text.slice(primary.length).replace(/^,\s*/, "").trim()
                        : "") ||
                    "";
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
                return {
                    placeId,
                    primaryText: primary,
                    secondaryText: secondary,
                    mapsUrl,
                };
            })
            .filter((s) => s.primaryText.length > 0)
            .slice(0, 5);

        return NextResponse.json({ suggestions });
    } catch (err) {
        clearTimeout(timeout);
        if (err instanceof Error && err.name === "AbortError") {
            return NextResponse.json({ error: "Search timed out" }, { status: 504 });
        }
        logger.error({ err }, "[places/autocomplete]");
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
