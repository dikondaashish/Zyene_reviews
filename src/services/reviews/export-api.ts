import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import type {
    PrivateFeedbackExportRow,
    PublicReviewExportRow,
} from "@/types/api-routes";

export async function handleReviewsExport(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "public";

    const { business } = await getActiveBusinessId();

    if (!business) return new NextResponse("No business found", { status: 403 });

    let csvData = "";
    let filename = "";

    if (type === "private") {
        const { data: feedback } = await supabase
            .from("private_feedback")
            .select(`
                id,
                rating,
                content,
                created_at,
                customer_email,
                customer_phone,
                review_requests (
                    customer_name,
                    customer_email,
                    customer_phone
                )
            `)
            .eq("business_id", business.id)
            .order("created_at", { ascending: false });

        const privateRows = (feedback || []) as PrivateFeedbackExportRow[];
        const formatted = privateRows.map((feedbackRow) => ({
            "Date": new Date(feedbackRow.created_at).toLocaleString(),
            "Rating": feedbackRow.rating,
            "Feedback": feedbackRow.content || "No details provided.",
            "Customer Name": feedbackRow.review_requests?.customer_name || "Anonymous",
            "Customer Email":
                feedbackRow.customer_email || feedbackRow.review_requests?.customer_email || "",
            "Customer Phone":
                feedbackRow.customer_phone || feedbackRow.review_requests?.customer_phone || "",
        }));

        csvData = Papa.unparse(formatted);
        const name = business.name || "business";
        filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_private_feedback.csv`;
    } else {
        const { data: reviews } = await supabase
            .from("reviews")
            .select(`
                id,
                rating,
                content:text,
                author_name,
                sentiment,
                published_at:review_date,
                created_at,
                response_status,
                review_platforms (
                    platform
                )
            `)
            .eq("business_id", business.id)
            .eq("is_visible", true)
            .order("review_date", { ascending: false });

        const publicRows = (reviews || []) as PublicReviewExportRow[];
        const formatted = publicRows.map((reviewRow) => ({
            "Date": new Date(reviewRow.published_at || reviewRow.created_at).toLocaleString(),
            "Rating": reviewRow.rating,
            "Author": reviewRow.author_name || "Anonymous",
            "Platform": reviewRow.review_platforms?.platform || "Direct",
            "Content": reviewRow.content || "",
            "Sentiment": reviewRow.sentiment || "",
            "Response Status": reviewRow.response_status || "pending"
        }));

        csvData = Papa.unparse(formatted);
        const name = business.name || "business";
        filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_public_reviews.csv`;
    }

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
