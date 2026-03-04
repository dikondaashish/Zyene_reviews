import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { sendReviewRequest } from "@/lib/notifications/review-request";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (
        process.env.NODE_ENV === "development" &&
        process.env.ALLOW_INSECURE_CRON === "true"
    ) {
        // allow through for local dev only
    } else if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const admin = createAdminClient();

        console.log("[Cron] Starting automated follow-up sequence check");

        // 1. Fetch campaigns that have follow-ups enabled
        const { data: campaigns, error: campaignError } = await admin
            .from("campaigns")
            .select("id, follow_up_enabled, follow_up_delay_hours, channel, follow_up_template, businesses (id, name, logo_url)")
            .eq("status", "active")
            .eq("follow_up_enabled", true);

        if (campaignError) throw campaignError;

        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ success: true, processed: 0, message: "No active follow-up campaigns found" });
        }

        let totalFollowUpsSent = 0;

        for (const campaign of campaigns) {
            if (!campaign.businesses) continue;

            const delayHours = campaign.follow_up_delay_hours || 72; // Default 3 days
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - delayHours);

            // 2. Find eligible review requests for this campaign
            // Eligible: status='delivered', review_left=false, is_follow_up_sent=false, sent_at < cutoffTime
            const { data: eligibleRequests, error: requestError } = await admin
                .from("review_requests")
                .select("id, customer_name, customer_email, customer_phone")
                .eq("campaign_id", campaign.id)
                .eq("status", "delivered")
                .eq("review_left", false)
                .eq("is_follow_up_sent", false)
                .lt("sent_at", cutoffTime.toISOString())
                .limit(50); // Process in batches

            if (requestError) {
                console.error(`[Cron] Error fetching requests for campaign ${campaign.id}:`, requestError);
                continue;
            }

            if (!eligibleRequests || eligibleRequests.length === 0) continue;

            // 3. Dispatch follow-ups
            for (const req of eligibleRequests) {
                const contactMethods = [];
                if (campaign.channel === "email" || campaign.channel === "both") {
                    if (req.customer_email) contactMethods.push("email");
                }
                if (campaign.channel === "sms" || campaign.channel === "both") {
                    if (req.customer_phone) contactMethods.push("sms");
                }

                try {
                    const business = Array.isArray(campaign.businesses) ? campaign.businesses[0] : campaign.businesses;
                    if (!business) continue;

                    await sendReviewRequest({
                        businessId: business.id,
                        businessName: business.name,
                        customerName: req.customer_name || "Customer",
                        contactMethods: contactMethods as ("email" | "sms")[],
                        customerEmail: req.customer_email,
                        customerPhone: req.customer_phone,
                        template: campaign.follow_up_template || undefined,
                        isFollowUp: true
                    });

                    // Update request status
                    await admin
                        .from("review_requests")
                        .update({
                            is_follow_up_sent: true,
                            follow_up_sent_at: new Date().toISOString()
                        })
                        .eq("id", req.id);

                    totalFollowUpsSent++;
                } catch (sendError) {
                    console.error(`[Cron] Failed to send follow-up to request ${req.id}:`, sendError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            campaignsProcessed: campaigns.length,
            followUpsSent: totalFollowUpsSent
        });

    } catch (error: any) {
        console.error("[Cron] Follow-up job failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
