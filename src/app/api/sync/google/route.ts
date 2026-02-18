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
        console.error("Sync Error:", error);

        if (error.code === 'CONFLICT') {
            return new Response(JSON.stringify({ message: "Sync already in progress." }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (error.code === 'RATE_LIMIT') {
            return new Response(JSON.stringify({ message: "Rate limit reached. Please try again later." }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let status = 500;
        let message = "Failed to sync reviews";

        // Check for specific Google implementation errors
        if (error.message.includes("No Google Accounts")) {
            status = 400;
            message = "No Google Business Profile found.";
        } else if (error.message.includes("reconnect")) {
            status = 401;
            message = "Authentication expired. Please reconnect Google.";
        }

        return new Response(JSON.stringify({ error: message, details: error.message }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
