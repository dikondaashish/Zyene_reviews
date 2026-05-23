import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { NextResponse } from "next/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { z } from "zod";

const createCampaignSchema = z.object({
    name: z.string().min(1).max(255),
    status: z.enum(["active", "paused", "draft"]).default("draft"),
    trigger_type: z.enum(["manual_batch", "scheduled", "pos_payment"]).default("manual_batch"),
    channel: z.enum(["sms", "email", "both"]).default("sms"),
    sms_template: z.string().optional(),
    email_subject: z.string().max(255).optional(),
    email_template: z.string().optional(),
    delay_minutes: z.number().int().min(0).default(0),
    follow_up_enabled: z.boolean().default(false),
    follow_up_delay_hours: z.number().int().min(1).default(48),
    follow_up_template: z.string().optional(),
});

// GET /api/campaigns — list campaigns for the user's ACTIVE business
export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use the active business from cookie (respects business switcher)
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return NextResponse.json({ campaigns: [] });
    }

    const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (error) {
        logger.error({ err: error }, "Campaigns fetch error:");
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    return NextResponse.json({ campaigns });
}

// POST /api/campaigns — create a new campaign
export async function POST(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Force email verification for active campaigns
    const body = await request.json();
    if (body.status === "active" && !user.email_confirmed_at) {
        return NextResponse.json(
            { error: "Email verification required", code: "EMAIL_NOT_VERIFIED" },
            { status: 403 }
        );
    }
    const parsed = createCampaignSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid data", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    // Get user's active business
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return NextResponse.json({ error: "No business found" }, { status: 404 });
    }

    const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
            business_id: businessId,
            ...parsed.data,
        })
        .select()
        .single();

    if (error) {
        logger.error({ err: error }, "Campaign create error:");
        return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign }, { status: 201 });
}
