import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status } = await request.json();
        if (!status || !['pending', 'responded', 'ignored'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // 1. Fetch Review to get Business ID
        const { data: review, error: fetchError } = await supabase
            .from("reviews")
            .select("business_id")
            .eq("id", id)
            .single();

        if (fetchError || !review) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // 2. Verify Access
        const hasAccess = await userCanAccessBusiness(supabase, user.id, review.business_id);
        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // 3. Update Status
        const { data, error: updateError } = await supabase
            .from("reviews")
            .update({ response_status: status })
            .eq("id", id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Review PATCH Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
