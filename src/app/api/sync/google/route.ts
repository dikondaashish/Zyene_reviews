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
        console.error("Sync Route Error:", error);

        // Handle Token Errors gracefully
        if (error.message.includes("Failed to refresh token") || error.message.includes("No refresh token available")) {
            return NextResponse.json({
                error: "Authentication failed. Please reconnect your Google account.",
                code: "AUTH_ERROR"
            }, { status: 401 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
