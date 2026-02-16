import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { replyToReview, listAccounts } from "@/lib/google/business-profile";
import { getValidGoogleToken } from "@/lib/google/sync-service";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { text } = await request.json();
        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
        }

        // 2. Fetch Review & Verify Ownership
        const { data: review, error: reviewError } = await supabase
            .from("reviews")
            .select(`
                *,
                businesses!inner(
                    organization_members!inner(user_id)
                )
            `)
            .eq("id", params.id)
            .eq("businesses.organization_members.user_id", user.id)
            .single();

        if (reviewError || !review) {
            console.error("Review Fetch Error or Not Found:", reviewError);
            return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 });
        }

        // 3. Validate Platform
        if (review.platform !== 'google') {
            return NextResponse.json({ error: "Only Google reviews supported currently" }, { status: 400 });
        }

        if (!review.platform_id) {
            return NextResponse.json({ error: "Review is missing platform connection" }, { status: 500 });
        }

        // 4. Get Valid Token (handles refresh)
        const { accessToken, platform } = await getValidGoogleToken(review.platform_id);

        // 5. Resolve Location & Account IDs
        const locationId = platform.external_id;
        if (!locationId) throw new Error("Platform location ID missing");

        // We need Account ID. Since we don't store it, fetch lists.
        // TODO: Store account_id in review_platforms to optimize this.
        const accounts = await listAccounts(accessToken);
        // Prioritize ORGANIZATION type if multiple, else first.
        const account = accounts.find((a: any) => a.type === "ORGANIZATION") || accounts[0];

        if (!account) throw new Error("No Google Business Account found");

        const accountId = account.name.split("/")[1];

        // 6. Post Reply to Google
        await replyToReview(accessToken, accountId, locationId, review.external_id, text);

        // 7. Update Database
        const admin = createAdminClient();
        const { error: updateError } = await admin
            .from("reviews")
            .update({
                response_status: "responded",
                response_text: text,
                responded_at: new Date().toISOString()
            })
            .eq("id", review.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Reply API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to post reply" }, { status: 500 });
    }
}
