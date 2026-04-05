import { createClient } from "@/lib/db/supabase/server";
import { syncFacebookReviewsForPlatform } from "@/services/facebook/sync-service";
import { NextResponse } from "next/server";
import { syncRateLimit } from "@/lib/auth/rate-limit";
import type { SyncMemberOrganizationData } from "@/types/api-routes";

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
        return NextResponse.json({ error: "Sync rate limit exceeded. Please wait 1 minute." }, { status: 429 });
    }

    try {
        // 1. Get Facebook Platform ID
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

        const memberTyped = memberData as SyncMemberOrganizationData;
        const business = memberTyped.organizations?.businesses?.[0];
        if (!business) throw new Error("Business record missing");

        const platform = business.review_platforms?.find((reviewPlatform) => reviewPlatform.platform === "facebook");
        if (!platform) throw new Error("Facebook platform not connected");

        // 2. Call Sync Service
        console.log(`[Manual Sync] Triggered for platform ${platform.id}`);
        const result = await syncFacebookReviewsForPlatform(platform.id);

        return NextResponse.json(result);

    } catch (error: unknown) {
        console.error("Facebook Sync Error:", error);

        let status = 500;
        let message = error instanceof Error ? error.message : "Failed to sync reviews";
        
        if (message === "Business not found" || message === "Facebook platform not connected") {
            status = 404;
        }

        return NextResponse.json(
            { error: message },
            { status }
        );
    }
}
