
import { createClient } from "@/lib/db/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const roleSchema = z.enum(["owner", "admin", "member", "ORG_OWNER", "ORG_ADMIN"]);

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = roleSchema.safeParse((await request.json())?.role);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const role = parsed.data;

    // Verify requester is owner (only owner can change roles? or admins too?)
    // Typically admins can manage members, Owners manage everything.
    // Let's say Owners/Admins can manage, but can't change Owner's role.
    const { data: requester, error: reqError } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    if (reqError || !["owner", "admin", "ORG_OWNER", "ORG_ADMIN"].includes(requester.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: targetMember } = await supabase
        .from("organization_members")
        .select("id, role, user_id")
        .eq("id", id)
        .eq("organization_id", requester.organization_id)
        .maybeSingle();
    if (!targetMember) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    if (!["owner", "ORG_OWNER"].includes(requester.role) && ["owner", "ORG_OWNER"].includes(role)) {
        return NextResponse.json({ error: "Only owners can assign owner role" }, { status: 403 });
    }
    if (["owner", "ORG_OWNER"].includes(targetMember.role) && !["owner", "ORG_OWNER"].includes(requester.role)) {
        return NextResponse.json({ error: "Only owners can modify owner role" }, { status: 403 });
    }

    // Determine target type?
    // This route is for changing MEMBERS role. Invites role can't be changed easily in this UI pattern usually, or we recreate invite.
    // We assume ID is organization_member.id

    const { error: updateError } = await supabase
        .from("organization_members")
        .update({ role })
        .eq("id", id)
        .eq("organization_id", requester.organization_id); // Security check

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "member"; // 'member' or 'invite'

    // Verify requester
    const { data: requester, error: reqError } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    if (reqError || !["owner", "admin", "ORG_OWNER", "ORG_ADMIN"].includes(requester.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (type === "invite") {
        const { error } = await supabase
            .from("invitations")
            .delete()
            .eq("id", id)
            .eq("organization_id", requester.organization_id);

        if (error) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });

    } else {
        const { data: targetMember } = await supabase
            .from("organization_members")
            .select("id, role, user_id")
            .eq("id", id)
            .eq("organization_id", requester.organization_id)
            .maybeSingle();
        if (!targetMember) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        if (targetMember.user_id === user.id) {
            return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
        }
        if (["owner", "ORG_OWNER"].includes(targetMember.role)) {
            return NextResponse.json({ error: "Owner cannot be removed" }, { status: 403 });
        }
        const { error } = await supabase
            .from("organization_members")
            .delete()
            .eq("id", id)
            .eq("organization_id", requester.organization_id);

        if (error) return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
