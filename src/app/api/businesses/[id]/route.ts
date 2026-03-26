
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
    const body = await request.json();

    // Verify ownership via organization_members
    const { data: membership, error: membError } = await supabase
        .from("organization_members")
        .select("role, organizations!inner(businesses!inner(id))")
        .eq("user_id", user.id)
        .eq("organizations.businesses.id", id)
        .single();

    if (membError || !membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update business
    const { data, error } = await supabase
        .from("businesses")
        .update(body)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json(data);
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

    // Verify user belongs to org that owns this business.
    const { data: membership, error: membError } = await supabase
        .from("organization_members")
        .select("organization_id, organizations!inner(businesses!inner(id))")
        .eq("user_id", user.id)
        .eq("organizations.businesses.id", id)
        .maybeSingle();

    if (membError || !membership?.organization_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent deleting the last non-archived business in the org.
    const { count: activeCount, error: countErr } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", membership.organization_id)
        .neq("status", "archived");

    if (countErr) {
        return NextResponse.json({ error: "Failed to validate business count" }, { status: 500 });
    }
    if ((activeCount ?? 0) <= 1) {
        return NextResponse.json(
            { error: "You must keep at least one active business." },
            { status: 400 }
        );
    }

    const { error: archiveErr } = await supabase
        .from("businesses")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("id", id);

    if (archiveErr) {
        return NextResponse.json({ error: "Failed to delete business" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
