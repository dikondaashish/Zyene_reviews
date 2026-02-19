import { createClient } from "@/lib/supabase/server";
import { syncGoogleReviewsForPlatform } from "@/lib/google/sync-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        if (membError || !memberData) throw new Error("Business not found");

        // @ts-ignore
        const business = memberData.organizations.businesses?.[0];
        if (!business) throw new Error("Business record missing");

        // @ts-ignore
        const platform = business.review_platforms?.find((p: any) => p.platform === 'google');
        if (!platform) throw new Error("Google platform not connected");

        // 2. Call Sync Service
        console.log(`[Manual Sync] Triggered for platform ${platform.id}`);
        const result = await syncGoogleReviewsForPlatform(platform.id);

        return NextResponse.json(result);

    } catch (error: any) {
        // 1. Conflict (Already Running)
        if (error.code === 'CONFLICT') {
            console.warn(`[Sync API] 409 Conflict: ${error.message}`);
            return NextResponse.json({ message: error.message }, { status: 409 });
        }

        // 2. Rate Limit (Cooldown)
        if (error.code === 'RATE_LIMIT') {
            console.warn(`[Sync API] 429 Rate Limit: ${error.message}`);
            return NextResponse.json({ message: error.message }, { status: 429 });
        }

        // 3. Auth / Business Logic Errors
        let status = 500;
        let message = "Failed to sync reviews";

        if (error.message.includes("No Google Accounts")) {
            status = 400;
            message = "No Google Business Profile found.";
        } else if (error.message.includes("reconnect") || error.message.includes("refresh token")) {
            status = 401;
            message = "Authentication expired. Please reconnect Google.";
        } else if (error.message === "Business not found" || error.message === "Google platform not connected") {
            status = 404;
            message = error.message;
        }

        console.error("Sync Error:", error);
        return NextResponse.json(
            { error: message, details: error.message },
            { status }
        );
    }
}
