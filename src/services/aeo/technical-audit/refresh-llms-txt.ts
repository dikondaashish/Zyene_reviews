import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";
import { checkOriginIsPublic } from "@/services/aeo/crawler/ssrf-guard";
import { parseLlmsTxt } from "./llms-txt";

type Admin = SupabaseClient<Database>;

export async function refreshLlmsTxtAudit(db: Admin, businessId: string) {
    const business = await db.from("businesses").select("website").eq("id", businessId).single();
    if (business.error || !business.data.website) return { skipped: "website_not_configured" as const };
    const target = new URL("/llms.txt", business.data.website).toString();
    const safety = await checkOriginIsPublic(target);
    if (!safety.safe) return { skipped: "unsafe_origin" as const };
    let status: number | null = null;
    let content = "";
    try {
        const response = await fetch(target, { redirect: "error", signal: AbortSignal.timeout(12_000),
            headers: { "User-Agent": "Zyene-AEO-Audit/1.0", Accept: "text/plain,text/markdown" } });
        status = response.status;
        if (response.ok) content = (await response.text()).slice(0, 512_000);
    } catch { /* A failed fetch is a measured absence, persisted below. */ }
    const parsed = content ? parseLlmsTxt(content) : { valid: false, issues: ["missing_or_unreachable"] };
    const write = await db.from("aeo_llms_txt_audits" as never).insert({
        business_id: businessId, url: target, http_status: status, present: Boolean(content), valid: parsed.valid,
        content_hash: content ? createHash("sha256").update(content).digest("hex") : null,
        issues: parsed.issues, checked_at: new Date().toISOString(),
    } as never);
    if (write.error) throw new Error(`llms.txt audit insert failed: ${write.error.message}`);
    return { present: Boolean(content), valid: parsed.valid, status };
}
