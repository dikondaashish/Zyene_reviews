import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await req.json();

    if (!businessId) {
        return NextResponse.json({ error: "Business ID required" }, { status: 400 });
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate a new API key
    const apiKey = `zy_${randomBytes(32).toString("hex")}`;

    // Upsert into integrations table (or a dedicated api_keys table)
    // Using review_platforms with platform='api' as a lightweight approach
    const { data: existing } = await supabase
        .from("review_platforms")
        .select("id")
        .eq("business_id", businessId)
        .eq("platform", "api")
        .single();

    if (existing) {
        await supabase
            .from("review_platforms")
            .update({
                external_id: apiKey,
                sync_status: "active",
                updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
    } else {
        await supabase.from("review_platforms").insert({
            business_id: businessId,
            platform: "api",
            external_id: apiKey,
            sync_status: "active",
        });
    }

    return NextResponse.json({ apiKey });
}
