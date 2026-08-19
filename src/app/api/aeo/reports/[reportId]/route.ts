import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";

const formatSchema = z.enum(["html", "pdf"]).optional();

export async function GET(request: Request, context: { params: Promise<{ reportId: string }> }) {
    const parsed = z.uuid().safeParse((await context.params).reportId);
    if (!parsed.success) return NextResponse.json({ error: "Invalid report" }, { status: 400 });
    const format = formatSchema.safeParse(new URL(request.url).searchParams.get("format") ?? undefined);
    if (!format.success) return NextResponse.json({ error: "Invalid report format" }, { status: 400 });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await supabase.from("aeo_reports" as never).select("storage_path, html" as never)
        .eq("id" as never, parsed.data as never).maybeSingle() as unknown as { data: { storage_path: string | null; html: string | null } | null };
    if (format.data === "html" && result.data?.html) {
        return new NextResponse(result.data.html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="aeo-report-${parsed.data}.html"` } });
    }
    if (!result.data?.storage_path) return NextResponse.json({ error: "Report not found" }, { status: 404 });
    const signed = await createAdminClient().storage.from("aeo-reports").createSignedUrl(result.data.storage_path, 60);
    if (signed.error) return NextResponse.json({ error: "Report unavailable" }, { status: 500 });
    return NextResponse.redirect(signed.data.signedUrl);
}
