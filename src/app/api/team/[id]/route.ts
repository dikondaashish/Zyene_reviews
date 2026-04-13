
import { createClient } from "@/lib/db/supabase/server";
import { apiOk, apiError } from "@/app/api/_shared/responses";
import { z } from "zod";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import {
    BUSINESS_MEMBER_ROLES,
    canManageBusinessTeam,
    isElevatedBusinessRole,
} from "@/lib/team/business-team";

const roleSchema = z.enum(BUSINESS_MEMBER_ROLES as unknown as [string, ...string[]]);

export async function PATCH(
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

    const { id } = await params;
    const parsed = roleSchema.safeParse((await request.json())?.role);
    if (!parsed.success) {
        return apiError("Invalid role", { status: 400 });
    }
    const role = parsed.data;

    const { businessId } = await getActiveBusinessId();
    if (!businessId) {
        return apiError("No active business selected", { status: 400 });
    }

    const { data: requester, error: reqError } = await supabase
        .from("business_members")
        .select("role, business_id")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .single();

    if (reqError || !canManageBusinessTeam(requester.role)) {
        return apiError("Forbidden", { status: 403 });
    }

    const { data: targetMember } = await supabase
        .from("business_members")
        .select("id, role, user_id")
        .eq("id", id)
        .eq("business_id", requester.business_id)
        .maybeSingle();
    if (!targetMember) {
        return apiError("Member not found", { status: 404 });
    }
    if (targetMember.user_id === user.id) {
        return apiError("You cannot change your own role here", { status: 400 });
    }
    if (requester.role !== "owner" && role === "owner") {
        return apiError("Only owners can assign owner role", { status: 403 });
    }
    if (targetMember.role === "owner" && requester.role !== "owner") {
        return apiError("Only owners can modify owner role", { status: 403 });
    }
    if (requester.role === "manager") {
        if (isElevatedBusinessRole(targetMember.role)) {
            return apiError("Managers cannot modify owners or admins", { status: 403 });
        }
        if (isElevatedBusinessRole(role)) {
            return apiError("Managers cannot assign admin or owner roles", { status: 403 });
        }
    }

    const { error: updateError } = await supabase
        .from("business_members")
        .update({ role })
        .eq("id", id)
        .eq("business_id", requester.business_id);

    if (updateError) {
        return apiError(updateError.message, { status: 500 });
    }

    return apiOk({ updated: true });
}

export async function DELETE(
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

    const { id } = await params;
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "member"; // 'member' or 'invite'
    const { businessId } = await getActiveBusinessId();
    if (!businessId) {
        return apiError("No active business selected", { status: 400 });
    }

    const { data: requester, error: reqError } = await supabase
        .from("business_members")
        .select("role, business_id")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .single();

    if (reqError || !canManageBusinessTeam(requester.role)) {
        return apiError("Forbidden", { status: 403 });
    }

    if (type === "invite") {
        const { error } = await supabase
            .from("invitations")
            .delete()
            .eq("id", id)
            .eq("business_id", requester.business_id);

        if (error) return apiError("Internal Server Error", { status: 500 });

    } else {
        const { data: targetMember } = await supabase
            .from("business_members")
            .select("id, role, user_id")
            .eq("id", id)
            .eq("business_id", requester.business_id)
            .maybeSingle();
        if (!targetMember) {
            return apiError("Member not found", { status: 404 });
        }
        if (targetMember.user_id === user.id) {
            return apiError("You cannot remove yourself", { status: 400 });
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
    }

    return apiOk({ deleted: true });
}
