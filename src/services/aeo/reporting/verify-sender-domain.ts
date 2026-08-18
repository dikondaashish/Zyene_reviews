import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/supabase/database.types";

type Admin = SupabaseClient<Database>;
type ResendDomain = { name?: string; status?: string };

export async function verifySenderDomain(db: Admin, organizationId: string, domain: string) {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) return { verified: false, reason: "resend_not_configured" as const };
    const response = await fetch("https://api.resend.com/domains?limit=100", {
        headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Resend domains returned HTTP ${response.status}`);
    const payload = await response.json() as { data?: ResendDomain[] };
    const match = (payload.data ?? []).find((row) => row.name?.toLowerCase() === domain.toLowerCase());
    const verified = match?.status === "verified";
    const update = await db.from("organizations" as never).update({
        aeo_sender_domain_status: verified ? "verified" : match ? "pending" : "failed",
        aeo_sender_domain_checked_at: new Date().toISOString(),
    } as never).eq("id" as never, organizationId);
    if (update.error) throw new Error(`Sender verification update failed: ${update.error.message}`);
    return { verified, reason: verified ? null : match ? "pending" as const : "not_found" as const };
}
