import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { authorizeAeoScope, corsPreflight, withCors } from "@/app/api/v1/_lib/auth";
import { parsePage } from "@/app/api/v1/aeo/_lib/query";

export async function OPTIONS() { return corsPreflight(); }

export async function GET(req: NextRequest) {
    const auth = await authorizeAeoScope(req, "prompts:read");
    if (!auth.ok) return auth.response;
    const page = parsePage(req.nextUrl.searchParams);
    if (!page) return withCors(NextResponse.json({ success: false, error: "Invalid pagination" }, { status: 400 }));
    const result = await createAdminClient().from("aeo_prompts")
        .select("id, prompt_text, source, intent, cluster_id, locale_country, locale_language, locale_city, is_active, created_at, updated_at", { count: "exact" })
        .eq("business_id", auth.businessId).order("created_at", { ascending: false }).range(page.from, page.to);
    if (result.error) return withCors(NextResponse.json({ success: false, error: "Failed to fetch prompts" }, { status: 500 }));
    return withCors(NextResponse.json({ success: true, data: { page: page.page, limit: page.limit, total: result.count ?? 0, prompts: result.data ?? [] } }));
}
