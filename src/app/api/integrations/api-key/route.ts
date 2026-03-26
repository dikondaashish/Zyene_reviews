import { createClient } from "@/lib/db/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

const requestSchema = z.object({
    businessId: z.string().uuid(),
});

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid business ID" }, { status: 400 });
    }
    const { businessId } = parsed.data;

    const hasAccess = await userCanAccessBusiness(supabase, user.id, businessId);
    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate a new API key
    const apiKey = `zy_${randomBytes(32).toString("hex")}`;

    // Upsert into integrations table (or a dedicated api_keys table)
    // Using review_platforms with platform='api' as a lightweight approach
    const { data: existing, error: existingError } = await supabase
        .from("review_platforms")
        .select("id")
        .eq("business_id", businessId)
        .eq("platform", "api")
        .maybeSingle();
    if (existingError) {
        return NextResponse.json({ error: "Failed to check existing API key" }, { status: 500 });
    }

    if (existing) {
        const { error: updateError } = await supabase
            .from("review_platforms")
            .update({
                external_id: apiKey,
                sync_status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        if (updateError) {
            return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
        }
    } else {
        const { error: insertError } = await supabase.from("review_platforms").insert({
            business_id: businessId,
            platform: "api",
            external_id: apiKey,
            sync_status: "active",
            total_reviews: 0,
            average_rating: 0,
        });
        if (insertError) {
            return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
        }
    }

    return NextResponse.json({ apiKey });
}
