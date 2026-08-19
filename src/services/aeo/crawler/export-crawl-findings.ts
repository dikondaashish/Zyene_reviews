import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";

/** F7.2: every F5.2/F5.3 crawl finding recorded for this business. */
export async function handleCrawlFindingsExport() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { businessId, business } = await getActiveBusinessId();
    if (!businessId || !business) return new NextResponse("No active business", { status: 403 });

    const { data: findings, error } = await supabase
        .from("crawl_findings")
        .select("crawl_run_id, rule, severity, page_url, evidence, fix_instruction, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10000);

    if (error) {
        logger.error({ err: error }, "[aeo/crawl-findings/export]");
        return new NextResponse("Failed to load crawl findings", { status: 500 });
    }

    const rows = findings ?? [];
    const runIds = [...new Set(rows.map((f) => f.crawl_run_id))];
    const { data: runs } = runIds.length
        ? await supabase.from("crawl_runs").select("id, origin, started_at").in("id", runIds)
        : { data: [] };
    const runById = new Map((runs ?? []).map((r) => [r.id, r]));

    const formatted = rows.map((f) => {
        const run = runById.get(f.crawl_run_id);
        return {
            "Severity": f.severity,
            "Rule": f.rule,
            "Page": f.page_url ?? "(site-wide)",
            "Evidence": f.evidence,
            "Fix": f.fix_instruction,
            "Site": run?.origin ?? "",
            "Crawled (UTC)": run?.started_at ?? "",
            "Found (UTC)": f.created_at,
        };
    });

    const csvData = Papa.unparse(formatted);
    const safeName = (business.name || "business").replace(/[^a-z0-9]/gi, "_").toLowerCase();

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${safeName}_crawl_findings.csv"`,
        },
    });
}
