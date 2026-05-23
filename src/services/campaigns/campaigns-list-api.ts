import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { NextResponse } from "next/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { createCampaignSchema } from "./campaigns-schema";

export async function handleCampaignsList() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

export async function handleCampaignCreate(request: Request) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
