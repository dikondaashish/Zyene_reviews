import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import type { ReviewRequestExportRow } from "@/types/api-routes";

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { business } = await getActiveBusinessId();

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
            completed_at,
            created_at,
            sent_at
        `)
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

    const requestRows = (requests || []) as ReviewRequestExportRow[];
    const formatted = requestRows.map((requestRow) => {
        const converted =
            !!requestRow.review_left ||
            !!requestRow.completed_at ||
            requestRow.status === "completed" ||
            requestRow.status === "feedback_left";
        return {
            "Created At": new Date(requestRow.created_at).toLocaleString(),
            "Sent At": requestRow.sent_at ? new Date(requestRow.sent_at).toLocaleString() : "",
            "Name": requestRow.customer_name || "",
            "Phone": requestRow.customer_phone || "",
            "Email": requestRow.customer_email || "",
            "Channel": requestRow.channel,
            "Status": requestRow.status,
            "Converted to Review": converted ? "Yes" : "No",
        };
    });

    const csvData = Papa.unparse(formatted);
    const businessName = business.name || "business";
    const filename = `${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_review_requests.csv`;

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
