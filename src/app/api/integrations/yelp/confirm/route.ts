import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getBusiness, getReviews } from "@/lib/yelp/adapter";
import { syncYelpReviewsForPlatform } from "@/lib/yelp/sync-service";

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { yelpBusinessId, businessId } = await req.json();

        if (!yelpBusinessId || !businessId) {
            return NextResponse.json(
                { error: "Yelp business ID and business ID are required" },
                { status: 400 }
            );
        }

        // Verify user owns this business
        const { data: member } = await supabase
            .from("organization_members")
            .select("organizations ( businesses ( id ) )")
            .eq("user_id", user.id)
            .single();

        // @ts-ignore
        const businesses = member?.organizations?.businesses || [];
        // @ts-ignore
        const ownsBusiness = businesses.some((b: any) => b.id === businessId);

        if (!ownsBusiness) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Get Yelp business details for metadata
        const yelpBusiness = await getBusiness(yelpBusinessId);

        // Save to review_platforms
        const { data: platform, error } = await supabase
            .from("review_platforms")
            .upsert(
                {
                    business_id: businessId,
                    platform: "yelp",
                    external_id: yelpBusinessId,
                    external_url: yelpBusiness.yelpUrl,
                    sync_status: "active",
                    total_reviews: yelpBusiness.reviewCount,
                    average_rating: yelpBusiness.rating,
                },
                { onConflict: "business_id, platform" }
            )
            .select()
            .single();

        if (error) {
            console.error("[Yelp Confirm] Upsert error:", error);
            return NextResponse.json(
                { error: "Failed to save Yelp connection" },
                { status: 500 }
            );
        }

        // Trigger initial sync
        try {
            const syncResult = await syncYelpReviewsForPlatform(platform.id);
            return NextResponse.json({
                success: true,
                platform,
                syncResult,
                business: {
                    name: yelpBusiness.name,
                    rating: yelpBusiness.rating,
                    reviewCount: yelpBusiness.reviewCount,
                },
            });
        } catch (syncError: any) {
            // Connection saved but sync failed — user can retry
            console.error("[Yelp Confirm] Initial sync error:", syncError);
            return NextResponse.json({
                success: true,
                platform,
                syncResult: null,
                warning: "Connected but initial sync failed. It will retry automatically.",
                business: {
                    name: yelpBusiness.name,
                    rating: yelpBusiness.rating,
                    reviewCount: yelpBusiness.reviewCount,
                },
            });
        }
    } catch (error: any) {
        console.error("[Yelp Confirm] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to connect Yelp" },
            { status: 500 }
        );
    }
}
