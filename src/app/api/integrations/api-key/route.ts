import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";

const scope = z.enum(["prompts:read", "results:read", "citations:read", "scores:read"]);
const requestSchema = z.object({
    businessId: z.uuid(),
    name: z.string().trim().min(1).max(100).default("AEO API"),
    scopes: z.array(scope).min(1).max(4).default(["prompts:read", "results:read", "citations:read", "scores:read"]),
    rateLimitPerMinute: z.number().int().min(1).max(600).default(60),
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const parsed = requestSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ error: "Invalid API key request" }, { status: 400 });
        const input = parsed.data;
        if (!(await userCanAccessBusiness(supabase, user.id, input.businessId))) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const admin = createAdminClient();
        const business = await admin.from("businesses").select("organization_id").eq("id", input.businessId).single();
        if (business.error) return NextResponse.json({ error: "Business not found" }, { status: 404 });
        const apiKey = `zyaeo_${randomBytes(32).toString("hex")}`;
        const written = await admin.from("aeo_public_api_keys" as never).insert({
            organization_id: business.data.organization_id,
            business_id: input.businessId,
            name: input.name,
            key_prefix: apiKey.slice(0, 14),
            key_hash: createHash("sha256").update(apiKey).digest("hex"),
            scopes: input.scopes,
            rate_limit_per_minute: input.rateLimitPerMinute,
        } as never);
        if (written.error) return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
        return NextResponse.json({ apiKey, name: input.name, scopes: input.scopes });
    } catch {
        return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const parsed = z.object({ keyId: z.uuid() }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
    const visible = await supabase.from("aeo_public_api_keys" as never).select("id" as never)
        .eq("id" as never, parsed.data.keyId as never).maybeSingle() as unknown as { data: { id: string } | null };
    if (!visible.data) return NextResponse.json({ error: "API key not found" }, { status: 404 });
    const result = await createAdminClient().from("aeo_public_api_keys" as never)
        .update({ revoked_at: new Date().toISOString() } as never).eq("id" as never, parsed.data.keyId as never);
    if (result.error) return NextResponse.json({ error: "Unable to revoke API key" }, { status: 500 });
    return NextResponse.json({ revoked: true });
}
