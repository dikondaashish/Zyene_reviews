import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { searchPublicPlaces } from "@/lib/free-tools/places-public";
import { clientIpFrom, publicToolSearchRateLimit } from "@/lib/auth/rate-limit";

export async function GET(request: Request) {
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }
    if (q.length > 120) {
        return NextResponse.json({ error: "Search query is too long." }, { status: 400 });
    }

    try {
        const { success } = await publicToolSearchRateLimit.limit(clientIpFrom(request));
        if (!success) return NextResponse.json({ error: "Too many searches. Try again later." }, { status: 429 });
        const suggestions = await searchPublicPlaces(q);
        return NextResponse.json({ suggestions });
    } catch (err) {
        logger.error({ err: err }, "[tools/places-search]");
        return NextResponse.json({ error: "Search unavailable" }, { status: 503 });
    }
}
