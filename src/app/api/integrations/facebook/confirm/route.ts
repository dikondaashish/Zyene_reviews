import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getPageDetails } from "@/lib/facebook/adapter";
import { syncFacebookReviewsForPlatform } from "@/lib/facebook/sync-service";
import { cookies } from "next/headers";

/**
 * POST: Confirm Facebook page connection.
 * Reads from the fb_connect_data cookie set during the OAuth callback,
 * saves the selected page to review_platforms, and triggers initial sync.
 */
export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { pageId } = await req.json();

        if (!pageId) {
            return NextResponse.json(
                { error: "Page ID is required" },
                { status: 400 }
            );
        }

        // Read connect data from cookie
        const cookieStore = await cookies();
        const fbDataRaw = cookieStore.get("fb_connect_data")?.value;

        if (!fbDataRaw) {
            return NextResponse.json(
                {
                    error: "Facebook connection data expired. Please reconnect.",
                },
                { status: 400 }
            );
        }

        const fbData = JSON.parse(fbDataRaw);
        const selectedPage = fbData.pages.find(
            (p: any) => p.pageId === pageId
        );

        if (!selectedPage) {
            return NextResponse.json(
                { error: "Selected page not found" },
                { status: 400 }
            );
        }

        const businessId = fbData.businessId;

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

        // Get page details for metadata
        let pageDetails;
        try {
            pageDetails = await getPageDetails(
                selectedPage.pageId,
                selectedPage.pageAccessToken
            );
        } catch {
            pageDetails = {
                name: selectedPage.pageName,
                overallStarRating: 0,
                ratingCount: 0,
                link: `https://facebook.com/${selectedPage.pageId}`,
            };
        }

        // Save to review_platforms
        const tokenExpiry = new Date(
            Date.now() + (fbData.tokenExpiresIn || 5184000) * 1000
        );

        const { data: platform, error } = await supabase
            .from("review_platforms")
            .upsert(
                {
                    business_id: businessId,
                    platform: "facebook",
                    external_id: selectedPage.pageId,
                    external_url: pageDetails.link,
                    access_token: selectedPage.pageAccessToken,
                    token_expires_at: tokenExpiry.toISOString(),
                    sync_status: "active",
                    total_reviews: pageDetails.ratingCount,
                    average_rating: pageDetails.overallStarRating,
                },
                { onConflict: "business_id, platform" }
            )
            .select()
            .single();

        if (error) {
            console.error("[Facebook Confirm] Upsert error:", error);
            return NextResponse.json(
                { error: "Failed to save Facebook connection" },
                { status: 500 }
            );
        }

        // Clear the cookie
        const response = NextResponse.json({
            success: true,
            platform,
            page: {
                name: selectedPage.pageName,
                rating: pageDetails.overallStarRating,
                reviewCount: pageDetails.ratingCount,
            },
        });

        response.cookies.set("fb_connect_data", "", {
            maxAge: 0,
            path: "/",
        });

        // Trigger initial sync in the background
        try {
            await syncFacebookReviewsForPlatform(platform.id);
        } catch (syncError: any) {
            console.error(
                "[Facebook Confirm] Initial sync error:",
                syncError
            );
            // Connection saved, sync will retry on next cron
        }

        return response;
    } catch (error: any) {
        console.error("[Facebook Confirm] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to connect Facebook" },
            { status: 500 }
        );
    }
}
