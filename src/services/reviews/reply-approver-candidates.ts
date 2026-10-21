import type { SupabaseClient } from "@supabase/supabase-js";

export type ApproverCandidate = { userId: string; label: string; role: string };

const ORG_MANAGERS = ["owner", "admin", "manager", "ORG_OWNER", "ORG_ADMIN", "ORG_MANAGER"];

/** Team members who could approve replies: anyone with write access to this business. */
export async function listApproverCandidates(admin: SupabaseClient, businessId: string): Promise<ApproverCandidate[]> {
    const { data: business } = await admin.from("businesses").select("organization_id").eq("id", businessId).maybeSingle();
    if (!business) return [];
    const [{ data: members }, { data: orgMembers }] = await Promise.all([
        admin.from("business_members").select("user_id, role, users(email, full_name)").eq("business_id", businessId).eq("status", "active"),
        admin.from("organization_members").select("user_id, role, users(email, full_name)")
            .eq("organization_id", business.organization_id).eq("status", "active").in("role", ORG_MANAGERS),
    ]);
    const byId = new Map<string, ApproverCandidate>();
    for (const row of [...(orgMembers ?? []), ...(members ?? [])]) {
        if (row.role === "viewer") continue;
        const user = (Array.isArray(row.users) ? row.users[0] : row.users) as { email?: string | null; full_name?: string | null } | null;
        const label = user?.full_name?.trim() || user?.email || "Team member";
        if (!byId.has(row.user_id as string)) byId.set(row.user_id as string, { userId: row.user_id as string, label, role: String(row.role) });
    }
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}
