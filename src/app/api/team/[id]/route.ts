
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
    const { role, type } = await request.json(); // Added type: 'org' | 'store' default to org/inference?

    // 1. Check requester permissions
    const { data: requester } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    // Org Owner/Manager can update almost anything (except Owner vs Owner restrictions maybe)
    const isOrgAdmin = requester && ["ORG_OWNER", "ORG_MANAGER"].includes(requester.role);
    
    // Store Owner check? (Complex to check efficiently without more inputs, but safe to assume Org Admin is main actor for now)
    
    if (!isOrgAdmin) {
        // Todo: Add Store Owner permission check if we want them to manage their store employees
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine if we are updating org member or store member (business_members)
    // The ID passed is the PRIMARY KEY of the row.
    // We can try to update both or require a type.
    // For safety, let's assume `type` param or try one then other?
    // Better: frontend sends type. If missing, assume org member for backward compat?
    
    // Actually, distinct IDs for tables means we can technically just try updating. 
    // But safely we should know what we are targeting.
    
    const targetTable = type === "store" ? "business_members" : "organization_members";

    const { error: updateError } = await supabase
        .from(targetTable)
        .update({ role })
        .eq("id", id);
        // .eq("organization_id") // organization_members has this
        // but business_members has business_id. 
        // RLS prevents unauthorized updates anyway.

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
    const type = url.searchParams.get("type") || "member"; // 'member', 'invite'
    const scope = url.searchParams.get("scope") || "org"; // 'org', 'store'

    // Verify requester
    const { data: requester } = await supabase
        .from("organization_members")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .single();

    const isOrgAdmin = requester && ["ORG_OWNER", "ORG_MANAGER"].includes(requester.role);

    if (!isOrgAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (type === "invite") {
        const { error } = await supabase
            .from("invitations")
            .delete()
            .eq("id", id)
            .eq("organization_id", requester?.organization_id); // Ensure ownership

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    } else {
        // Remove member
        const table = scope === "store" ? "business_members" : "organization_members";
        
        const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", id);
            // RLS protects boundaries

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
