import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!orgMember) return new NextResponse("No organization found", { status: 403 });

    const { data: business } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("organization_id", orgMember.organization_id)
        .limit(1)
        .single();

    if (!business) return new NextResponse("No business found", { status: 403 });

    const { data: requests } = await supabase
        .from("review_requests")
        .select(`
            id,
            customer_name,
            customer_phone,
            customer_email,
            channel,
            status,
            review_left,
            created_at,
            sent_at
        `)
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

    const formatted = (requests || []).map((r: any) => ({
        "Created At": new Date(r.created_at).toLocaleString(),
        "Sent At": r.sent_at ? new Date(r.sent_at).toLocaleString() : "",
        "Name": r.customer_name || "",
        "Phone": r.customer_phone || "",
        "Email": r.customer_email || "",
        "Channel": r.channel,
        "Status": r.status,
        "Converted to Review": r.review_left ? "Yes" : "No"
    }));

    const csvData = Papa.unparse(formatted);
    const filename = `${business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_review_requests.csv`;

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
