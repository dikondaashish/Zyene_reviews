import { NextResponse } from "next/server";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { bearerMatches } from "@/lib/auth/constant-time-compare";

const payloadSchema = z.object({
    urls: z.array(z.string().url()).min(1),
});

export async function POST(request: Request) {
    try {
        if (!bearerMatches(request.headers.get("Authorization"), process.env.CRON_SECRET)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = payloadSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid payload format. Expected { urls: string[] } of valid URLs" },
                { status: 400 }
            );
        }

        const success = await pingIndexNow(parsed.data.urls);

        if (!success) {
            return NextResponse.json({ error: "Failed to ping IndexNow API" }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: parsed.data.urls.length });
    } catch (error) {
        logger.error({ err: error }, "Error in IndexNow API route");
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
