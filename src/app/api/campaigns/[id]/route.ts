import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Helper: verify ownership of a campaign
async function verifyCampaignOwnership(supabase: any, userId: string, campaignId: string) {
    const { data: memberData } = await supabase
        .from("organization_members")
        .select(`
            organizations (
                businesses ( id )
            )
        `)
        .eq("user_id", userId)
        .single();

    // @ts-ignore
    const businessId = memberData?.organizations?.businesses?.[0]?.id;
    if (!businessId) return null;

    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("business_id", businessId)
        .single();

    return campaign;
}

// GET /api/campaigns/[id] — single campaign with stats
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id: campaignId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaign = await verifyCampaignOwnership(supabase, user.id, campaignId);
    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Also fetch associated review_requests for the contacts table
    const { data: requests } = await supabase
        .from("review_requests")
        .select("id, customer_name, customer_phone, customer_email, channel, status, sent_at, opened_at, clicked_at, created_at")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

    return NextResponse.json({ campaign, requests: requests || [] });
}

// PATCH /api/campaigns/[id] — update campaign
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id: campaignId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaign = await verifyCampaignOwnership(supabase, user.id, campaignId);
    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();

    // Only allow safe fields to update
    const allowedFields = [
        "name", "status", "trigger_type", "channel",
        "sms_template", "email_subject", "email_template",
        "delay_minutes", "follow_up_enabled", "follow_up_delay_hours", "follow_up_template",
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
        if (body[key] !== undefined) {
            updates[key] = body[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", campaignId)
        .select()
        .single();

    if (error) {
        console.error("Campaign update error:", error);
        return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign: updated });
}

// DELETE /api/campaigns/[id] — delete campaign
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id: campaignId } = await params;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaign = await verifyCampaignOwnership(supabase, user.id, campaignId);
    if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

    if (error) {
        console.error("Campaign delete error:", error);
        return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
