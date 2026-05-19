import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { getRedisClient } from "@/lib/db/redis";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "error" | "skipped";

/**
 * Health check for load balancers and uptime monitors.
 * Returns 503 when a required dependency check fails in production.
 */
export async function GET() {
    const checks: Record<string, CheckStatus> = {};
    const isProduction = process.env.VERCEL_ENV === "production";

    try {
        const admin = createAdminClient();
        const { error } = await admin.from("businesses").select("id").limit(1);
        checks.database = error ? "error" : "ok";
    } catch {
        checks.database = "error";
    }

    const hasRedisEnv =
        Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim()) &&
        Boolean(process.env.UPSTASH_REDIS_REST_TOKEN?.trim());

    if (!hasRedisEnv) {
        checks.redis = isProduction ? "error" : "skipped";
    } else {
        try {
            const pong = await getRedisClient().ping();
            checks.redis = pong === "PONG" ? "ok" : "error";
        } catch {
            checks.redis = "error";
        }
    }

    const failed = Object.entries(checks).filter(([, status]) => status === "error");
    const healthy = failed.length === 0;

    return NextResponse.json(
        {
            status: healthy ? "ok" : "degraded",
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || "0.1.0",
            checks,
        },
        { status: healthy ? 200 : 503 }
    );
}
