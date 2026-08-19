import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import type { ReviewRequestExportRow } from "@/types/api-routes";
import { loadReviewRequestMetrics } from "@/lib/metrics/load-review-request-metrics";
import {
    isClickedRequest,
    isCompletedRequest,
    isDeliveredRequest,
    isOutboundRequest,
    isSentRequest,
} from "@/lib/metrics/business-metrics";

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { business } = await getActiveBusinessId();

    if (!business)
        return new NextResponse("No business found", { status: 403 });

    const loaded = await loadReviewRequestMetrics(supabase, business.id);
    if (!loaded.ok) {
        return new NextResponse("Failed to load requests", { status: 500 });
    }
    const requestRows = (loaded.rows as ReviewRequestExportRow[])
        .filter(isOutboundRequest)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    const formatted = requestRows.map((requestRow) => {
        return {
            "Created At": new Date(requestRow.created_at).toLocaleString(),
            "Sent At": requestRow.sent_at
                ? new Date(requestRow.sent_at).toLocaleString()
                : "",
            Name: requestRow.customer_name || "",
            Phone: requestRow.customer_phone || "",
            Email: requestRow.customer_email || "",
            Channel: requestRow.channel,
            Status: requestRow.status,
            "Email Status": requestRow.email_status || "",
            "SMS Status": requestRow.sms_status || "",
            "Counted as Sent": isSentRequest(requestRow) ? "Yes" : "No",
            "Counted as Delivered": isDeliveredRequest(requestRow)
                ? "Yes"
                : "No",
            "Counted as Clicked": isClickedRequest(requestRow) ? "Yes" : "No",
            "Counted as Completed": isCompletedRequest(requestRow)
                ? "Yes"
                : "No",
        };
    });

    const csvData = Papa.unparse(formatted);
    const businessName = business.name || "business";
    const filename = `${businessName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_review_requests.csv`;

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
