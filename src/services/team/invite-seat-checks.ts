import { apiError } from "@/app/api/_shared/responses";
import { teamMemberLimitForPlan } from "@/services/stripe/plans";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function assertTeamInviteSeatAvailable(
    supabase: SupabaseClient,
    params: {
        businessId: string;
        email: string;
        organizationId: string;
        plan: string | null | undefined;
        planStatus: string | null | undefined;
    }
) {
    let planRaw = params.plan;
    let planStatusRaw = params.planStatus;
    if (!planRaw || !planStatusRaw) {
        const { data: orgRow } = await supabase
            .from("organizations")
            .select("plan, plan_status")
            .eq("id", params.organizationId)
            .maybeSingle();
        planRaw = orgRow?.plan ?? null;
        planStatusRaw = orgRow?.plan_status ?? null;
    }
    const maxMembers = teamMemberLimitForPlan(planRaw, planStatusRaw);

    const { data: existingMembers } = await supabase
        .from("business_members")
        .select("users(email)")
        .eq("business_id", params.businessId);

    const alreadyOnTeam = (existingMembers ?? []).some((row) => {
        const users = row.users as { email?: string | null } | { email?: string | null }[] | null;
        const memberEmail = (Array.isArray(users) ? users[0]?.email : users?.email)?.trim().toLowerCase();
        return memberEmail === params.email;
    });
    if (alreadyOnTeam) {
        return apiError("This person is already on the team for this business.", { status: 400 });
    }

    const { count: currentMemberCount } = await supabase
        .from("business_members")
        .select("*", { count: "exact", head: true })
        .eq("business_id", params.businessId);

    const { count: pendingInviteCount } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("business_id", params.businessId)
        .is("accepted_at", null);

    const totalSeats = Number(currentMemberCount || 0) + Number(pendingInviteCount || 0);
    if (maxMembers !== -1 && totalSeats >= maxMembers) {
        return apiError("Team member limit reached. Please upgrade your plan.", { status: 403 });
    }

    return null;
}
