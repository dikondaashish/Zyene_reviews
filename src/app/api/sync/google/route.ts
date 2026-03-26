import { createClient } from "@/lib/supabase/server";
import { syncGoogleReviewsForPlatform } from "@/lib/google/sync-service";
import { syncGooglePerformanceForPlatform } from "@/lib/google/performance-sync";
import { syncGooglePhase2ForPlatform } from "@/lib/google/phase2-sync";
import { syncGoogleListingProfileForPlatform } from "@/lib/google/phase3-sync";
import { syncGoogleLodgingForPlatform } from "@/lib/google/phase4-sync";
import { NextResponse } from "next/server";
import { syncRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply Rate Limiting (1 sync per 5 mins per user)
    const { success: rateLimitSuccess } = await syncRateLimit.limit(user.id);
    if (!rateLimitSuccess) {
        return NextResponse.json({ error: "Sync rate limit exceeded. Please wait 5 minutes." }, { status: 429 });
    }

    try {
        // 1. Get Google Platform ID
        const { data: memberData, error: membError } = await supabase
            .from("organization_members")
            .select(`
                organization_id,
                organizations (
                    businesses (
                        id,
                        review_platforms!inner(id, platform)
                    )
                )
            `)
            .eq("user_id", user.id)
            .single();

        interface GoogleSyncContext {
            organizations: {
                businesses: Array<{
                    id: string;
                    review_platforms: Array<{ id: string; platform: string }>;
                }>;
            } | null;
        }

        if (membError || !memberData) throw new Error("Business not found");

        const memberTyped = memberData as unknown as GoogleSyncContext;
        const business = memberTyped.organizations?.businesses?.[0];
        if (!business) throw new Error("Business record missing");

        const platform = business.review_platforms?.find((p) => p.platform === 'google');
        if (!platform) throw new Error("Google platform not connected");

        // 2. Call Sync Service
        console.log(`[Manual Sync] Triggered for platform ${platform.id}`);
        const result = await syncGoogleReviewsForPlatform(platform.id);

        syncGooglePerformanceForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google Performance sync failed (non-fatal):", e);
        });
        syncGooglePhase2ForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google Q&A / place actions sync failed (non-fatal):", e);
        });
        syncGoogleListingProfileForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google listing / profile health sync failed (non-fatal):", e);
        });
        syncGoogleLodgingForPlatform(platform.id).catch((e) => {
            console.error("[Manual Sync] Google lodging sync failed (non-fatal):", e);
        });

        return NextResponse.json(result);

    } catch (error: any) {
        // 1. Conflict (Already Running)
        if (error.code === 'CONFLICT') {
            console.warn(`[Sync API] 409 Conflict: ${error.message}`);
            return NextResponse.json({ message: "Conflict: Google API resource state" }, { status: 409 });
        }

        // 2. Rate Limit (Cooldown)
        if (error.code === 'RATE_LIMIT') {
            console.warn(`[Sync API] 429 Rate Limit: ${error.message}`);
            return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
        }

        // 3. Auth / Business Logic Errors
        let status = 500;
        let message = "Failed to sync reviews";
        let details: string | undefined = "Internal Server Error";
        const errAny = error as { code?: string; message?: string; activationUrl?: string; userMessage?: string };

        if (errAny.code === "GOOGLE_API_DISABLED" || error.message.includes("GOOGLE_API_DISABLED")) {
            console.error("Sync Error:", error);
            return NextResponse.json(
                {
                    error: "Google My Business API is not enabled for this Cloud project.",
                    details:
                        "Use the link (same project as your OAuth client). Click Enable, then enable My Business Account Management and My Business Business Information APIs. Wait 2–5 minutes and try Sync again.",
                    activationUrl: errAny.activationUrl,
                    code: "GOOGLE_API_DISABLED",
                },
                { status: 403 }
            );
        } else if (errAny.code === "GOOGLE_GBP_ACCESS_PENDING" || error.message.includes("GOOGLE_GBP_ACCESS_PENDING")) {
            status = 403;
            message =
                "Google Business Profile API access or quota may still be pending. Submit Google’s access request if your quota is 0.";
            details = errAny.userMessage || error.message.replace(/^GOOGLE_GBP_ACCESS_PENDING:\s*/, "");
        } else if (errAny.code === "GOOGLE_REVIEWS_FORBIDDEN" || error.message.includes("GOOGLE_REVIEWS_FORBIDDEN")) {
            status = 403;
            message =
                "Google blocked access to your reviews (403). Usually: enable Google My Business API in Google Cloud, " +
                "use OAuth scope business.manage, and reconnect Google from Integrations.";
            details = error.message.replace(/^GOOGLE_REVIEWS_FORBIDDEN:\s*/, "");
        } else if (error.message.includes("403") && error.message.toLowerCase().includes("forbidden")) {
            status = 403;
            message =
                "Google denied access when loading reviews. Enable Google My Business API for your OAuth project " +
                "and reconnect Google with the Business Profile permission.";
            details = error.message;
        } else if (error.message.includes("No Google Accounts")) {
            status = 400;
            message = "No Google Business Profile found.";
        } else if (error.message.includes("reconnect") || error.message.includes("refresh token")) {
            status = 401;
            message = "Authentication expired. Please reconnect Google.";
        } else if (error.message === "Business not found" || error.message === "Google platform not connected") {
            status = 404;
            message = "Integration not found";
        }

        console.error("Sync Error:", error);
        return NextResponse.json(
            { error: message, details },
            { status }
        );
    }
}
