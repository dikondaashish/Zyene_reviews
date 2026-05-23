import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { searchPublicPlaces } from "@/lib/phase7/places-public";

export async function GET(request: Request) {
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        const suggestions = await searchPublicPlaces(q);
        return NextResponse.json({ suggestions });
    } catch (err) {
        logger.error({ err: err }, "[tools/places-search]");
        return NextResponse.json({ error: "Search unavailable" }, { status: 503 });
    }
}
