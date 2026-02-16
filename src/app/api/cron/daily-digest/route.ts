
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend/send-email";
import { dailyDigestEmail } from "@/lib/resend/templates/daily-digest-email";

export const runtime = "edge";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // 1. Get all businesses with active 'google' platform
    // We could filter businesses that actually have reviews in last 24h, but Supabase doesn't support complex joins easily in one go.
    // Better: Get reviews from last 24h, then group by business.

    const { data: recentReviews, error: reviewError } = await admin
        .from("reviews")
        .select(`
            id,
            rating,
            content,
            author_name,
            sentiment,
            created_at,
            business_id,
            businesses (
                id,
                name,
                organization_id,
                slug
            )
        `)
        .gte("created_at", yesterday.toISOString())
        .order("created_at", { ascending: false });

    if (reviewError) {
        return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }

    if (!recentReviews || recentReviews.length === 0) {
        return NextResponse.json({ message: "No new reviews found" });
    }

    // Group reviews by business
    const businessMap = new Map<string, any[]>();
    recentReviews.forEach((review: any) => {
        if (!review.businesses) return;
        const bid = review.business_id;
        if (!businessMap.has(bid)) {
            businessMap.set(bid, []);
        }
        businessMap.get(bid).push(review);
    });

    let emailsSent = 0;

    for (const [businessId, reviews] of businessMap.entries()) {
        const business = reviews[0].businesses;

        // 2. Get Pending Count for this business (all time pending)
        const { count: pendingCount } = await admin
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", businessId)
            .is("reply_text", null);

        // 3. Stats for Digest
        const totalNew = reviews.length;
        const avgRating = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalNew;
        const digestItems = reviews.slice(0, 5).map((r: any) => ({
            rating: r.rating,
            authorName: r.author_name,
            text: r.content || "",
            sentiment: r.sentiment
        }));

        // 4. Get Recruitpients (Org Members with Digest Enabled)
        const { data: members } = await admin
            .from("organization_members")
            .select("user_id")
            .eq("organization_id", business.organization_id);

        if (members && members.length > 0) {
            const userIds = members.map(m => m.user_id);

            const { data: prefs } = await admin
                .from("notification_preferences")
                .select("*, users(email)")
                .in("user_id", userIds);

            const recipients = prefs?.filter(p => {
                const digestEnabled = p.digest_enabled !== false; // Default true
                const hasEmail = (p.users as any)?.email;
                return digestEnabled && hasEmail;
            }) || [];

            // 5. Build & Send Email
            if (recipients.length > 0) {
                const emailHtml = dailyDigestEmail({
                    businessName: business.name,
                    reviews: digestItems,
                    totalNew,
                    avgRating,
                    pendingCount: pendingCount || 0,
                    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                    settingsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`
                });

                await Promise.all(recipients.map(recipient => {
                    const email = (recipient.users as any).email;
                    return sendEmail({
                        to: email,
                        subject: `Daily Review Summary for ${business.name}`,
                        html: emailHtml
                    });
                }));

                emailsSent += recipients.length;
            }
        }
    }

    return NextResponse.json({
        message: "Daily digest processed",
        businessesProcessed: businessMap.size,
        emailsSent
    });
}
