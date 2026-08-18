import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

const schema = z.object({ businessId: z.string().uuid(), name: z.string().trim().min(2).max(80), source: z.enum(["vercel", "cloudflare", "proxy", "manual"]) });

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "Invalid log source" }, { status: 400 });
        if (!(await userCanAccessBusiness(supabase, user.id, parsed.data.businessId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const admin = createAdminClient();
        const business = await admin.from("businesses").select("organization_id").eq("id", parsed.data.businessId).single();
        if (business.error) return NextResponse.json({ error: "Business not found" }, { status: 404 });
        const key = `zylog_${randomBytes(24).toString("base64url")}`;
        const written = await admin.from("aeo_crawler_log_sources" as never).insert({
            organization_id: business.data.organization_id, business_id: parsed.data.businessId,
            name: parsed.data.name, source: parsed.data.source, key_prefix: key.slice(0, 14),
            key_hash: createHash("sha256").update(key).digest("hex"),
        } as never);
        if (written.error) return NextResponse.json({ error: "Unable to create log source" }, { status: 500 });
        return NextResponse.json({ key, endpoint: "/api/aeo/crawler-logs" });
    } catch {
        return NextResponse.json({ error: "Unable to create log source" }, { status: 500 });
    }
}
