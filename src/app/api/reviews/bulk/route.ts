import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { userCanAccessBusiness } from "@/lib/supabase/verify-business-access";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ids, businessId, status } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0 || !businessId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!['pending', 'responded', 'ignored'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // 1. Verify Access
        const hasAccess = await userCanAccessBusiness(supabase, user.id, businessId);
        if (!hasAccess) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // 2. Perform Bulk Update
        const { count, error: updateError } = await supabase
            .from("reviews")
            .update({ response_status: status })
            .in("id", ids)
            .eq("business_id", businessId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, count });
    } catch (error: any) {
        console.error("Bulk Review Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
