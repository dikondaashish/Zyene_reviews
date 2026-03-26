import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { campaignRateLimit } from "@/lib/rate-limit";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";

const sendSchema = z.object({
    contacts: z.array(
        z.object({
            name: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
        })
    ).min(1).max(500),
});

// POST /api/campaigns/[id]/send — send campaign to contacts
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { id: campaignId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply Rate Limiting (5 campaigns/min per user)
    const { success: rateLimitSuccess } = await campaignRateLimit.limit(user.id);
    if (!rateLimitSuccess) {
        return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }

    // Parse body
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid data", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { data: campaign } = await supabase
        .from("campaigns")
        .select("id, business_id, status")
        .eq("id", campaignId)
        .maybeSingle();

    if (!campaign?.business_id) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    const canAccess = await userCanAccessBusiness(supabase, user.id, campaign.business_id);
    if (!canAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (campaign.status !== "active") {
        return NextResponse.json({ error: "Campaign is not active. Activate it first." }, { status: 400 });
    }

    // ── INNGEST BACKGROUND JOBS ──
    const { inngest } = await import("@/lib/inngest/client");

    const eventsToEnqueue = parsed.data.contacts.map((contact) => ({
        name: "campaign/send.contact" as const,
        data: {
            campaignId,
            businessId: campaign.business_id,
            contact: {
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
            },
        },
    }));

    try {
        await inngest.send(eventsToEnqueue);

        // Update campaign status to processing
        await admin
            .from("campaigns")
            .update({ status: "processing" })
            .eq("id", campaignId);

    } catch (e) {
        console.error("Failed to enqueue campaign events:", e);
        return NextResponse.json({ error: "Failed to queue campaign" }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `Queued ${eventsToEnqueue.length} contacts for background processing`,
        queuedCount: eventsToEnqueue.length
    });
}
