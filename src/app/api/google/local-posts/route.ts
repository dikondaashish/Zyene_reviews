import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { getValidGoogleToken } from "@/services/google/sync-service";
import { createLocalPost } from "@/services/google/local-posts";

const schema = z.object({ businessId: z.string().uuid(), summary: z.string().trim().min(1).max(1500), topicType: z.enum(["STANDARD", "EVENT", "OFFER", "ALERT"]).default("STANDARD") });

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "Invalid Google post" }, { status: 400 });
        if (!(await userCanAccessBusiness(supabase, user.id, parsed.data.businessId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const platform = await supabase.from("review_platforms").select("id, google_account_id, google_location_id")
            .eq("business_id", parsed.data.businessId).eq("platform", "google").single();
        if (platform.error || !platform.data.google_account_id || !platform.data.google_location_id) return NextResponse.json({ error: "Google Business Profile is not connected" }, { status: 404 });
        const token = await getValidGoogleToken(platform.data.id);
        if (!token.accessToken) return NextResponse.json({ error: "Google token unavailable" }, { status: 401 });
        const post = await createLocalPost(token.accessToken, platform.data.google_account_id, platform.data.google_location_id, parsed.data);
        return NextResponse.json({ post });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish Google post" }, { status: 400 });
    }
}
