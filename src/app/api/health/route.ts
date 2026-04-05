import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for monitoring and load balancers.
 * Returns 200 OK with basic app metadata.
 */
export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
    });
}
