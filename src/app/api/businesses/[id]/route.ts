
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
