import { logger } from "@/lib/logger";
import { z } from "zod";
import { deleteDeveloper } from "@/services/team/delete-developer";
import { createClient } from "@/lib/db/supabase/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { canManageBusinessTeam, isElevatedBusinessRole } from "@/lib/team/business-team";

export { patchTeamMember } from "@/services/team/team-member-update-api";

export async function deleteTeamMember(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        return await deleteAuthorizedTeamMember(request, context);
    } catch (error) {
        logger.error({ err: error }, "[team/delete] Removal failed");
        return apiError("Unable to remove member", { status: 500 });
    }
}

async function deleteAuthorizedTeamMember(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return apiError("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const parsed = z.object({ id: z.string().uuid(), type: z.enum(["member", "invite"]) })
        .safeParse({ ...(await params), type: url.searchParams.get("type") ?? "member" });
    if (!parsed.success) return apiError("Invalid member request", { status: 400 });
    const { id, type } = parsed.data;
    const { businessId, organization } = await getActiveBusinessId();
    if (!businessId) {
        return apiError("No active business selected", { status: 400 });
    }

    const { data: requester, error: reqError } = await supabase
        .from("business_members")
        .select("role, business_id, users(full_name)")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .eq("status", "active")
        .single();

    if (reqError || !requester || !canManageBusinessTeam(requester.role)) {
        return apiError("Forbidden", { status: 403 });
    }

    if (type === "invite") {
        const { data: inviteRow } = await supabase
            .from("invitations")
            .select("id, email")
            .eq("id", id)
            .eq("business_id", requester.business_id)
            .maybeSingle();
        const { error } = await supabase
            .from("invitations")
            .delete()
            .eq("id", id)
            .eq("business_id", requester.business_id);

        if (error) return apiError("Internal Server Error", { status: 500 });

        try {
            const requesterName =
                (requester as { users?: { full_name?: string | null } | null })?.users?.full_name || "Someone";
            await supabase.from("events").insert({
                organization_id: organization?.id as string,
                business_id: businessId,
                user_id: user.id,
                event_type: "team.invite_removed",
                entity_type: "invitation",
                entity_id: id,
                metadata: {
                    actor_name: requesterName,
                    invited_email: inviteRow?.email ?? null,
                },
            });
        } catch (e) {
            logger.error({ err: e }, "[team/delete invite] Failed to write event:");
        }

    } else {
        const { data: targetMember } = await supabase
            .from("business_members")
            .select("*, users(full_name, email)")
            .eq("id", id)
            .eq("business_id", requester.business_id)
            .maybeSingle();
        if (!targetMember) {
            return apiError("Member not found", { status: 404 });
        }
        if (targetMember.user_id === user.id) {
            return apiError("You cannot remove yourself", { status: 400 });
        }
        if ((targetMember as typeof targetMember & { role_label?: string }).role_label === "developer") {
            return deleteDeveloper(supabase, businessId, id);
        }
        if (targetMember.role === "owner") {
            return apiError("Owner cannot be removed", { status: 403 });
        }
        if (requester.role === "manager" && isElevatedBusinessRole(targetMember.role)) {
            return apiError("Managers cannot remove owners or admins", { status: 403 });
        }
        const { error } = await supabase
            .from("business_members")
            .delete()
            .eq("id", id)
            .eq("business_id", requester.business_id);

        if (error) return apiError("Internal Server Error", { status: 500 });

        try {
            const requesterName =
                (requester as { users?: { full_name?: string | null } | null })?.users?.full_name || "Someone";
            const targetName =
                (targetMember as { users?: { full_name?: string | null; email?: string | null } | null })?.users?.full_name ||
                (targetMember as { users?: { full_name?: string | null; email?: string | null } | null })?.users?.email ||
                "a member";
            await supabase.from("events").insert({
                organization_id: organization?.id as string,
                business_id: businessId,
                user_id: user.id,
                event_type: "team.member_removed",
                entity_type: "business_member",
                entity_id: targetMember.id,
                metadata: {
                    actor_name: requesterName,
                    target_name: targetName,
                    removed_role: targetMember.role,
                },
            });
        } catch (e) {
            logger.error({ err: e }, "[team/delete member] Failed to write event:");
        }
    }

    return apiOk({ deleted: true });
}
