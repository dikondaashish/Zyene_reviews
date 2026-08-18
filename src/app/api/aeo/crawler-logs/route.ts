import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { ingestCrawlerLogs } from "@/services/aeo/crawler-logs/ingest-logs";

const logSchema = z.object({
    timestamp: z.string().datetime(),
    method: z.string().trim().min(1).max(12),
    path: z.string().trim().min(1).max(4096),
    status: z.number().int().min(100).max(599),
    userAgent: z.string().trim().min(1).max(2048),
    requestId: z.string().trim().max(255).optional(),
});
const bodySchema = z.object({ logs: z.array(logSchema).min(1).max(500) });

export async function POST(request: Request) {
    try {
        const key = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
        if (!key?.startsWith("zylog_")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const parsed = bodySchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "Invalid log payload", details: parsed.error.flatten() }, { status: 400 });
        const result = await ingestCrawlerLogs(createAdminClient(), key, parsed.data.logs);
        if (!result.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return NextResponse.json(result, { status: 202 });
    } catch {
        return NextResponse.json({ error: "Crawler log ingestion failed" }, { status: 500 });
    }
}
