import { NextResponse } from "next/server";
import { aiBusinessDailyRateLimit } from "@/lib/auth/rate-limit";

export async function checkAiBusinessDailyBudget(businessId: string): Promise<NextResponse | null> {
    try {
        const { success } = await aiBusinessDailyRateLimit.limit(businessId);
        return success
            ? null
            : NextResponse.json({ error: "Daily AI generation limit reached for this business." }, { status: 429 });
    } catch {
        return NextResponse.json({ error: "AI generation is temporarily unavailable." }, { status: 503 });
    }
}
