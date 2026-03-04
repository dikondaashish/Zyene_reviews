import { createClient } from "@/lib/supabase/server";
import { getActiveBusinessId } from "@/lib/business-context";
import { NextResponse } from "next/server";
import Papa from "papaparse";

export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "public";

    // We cannot use getActiveBusinessId easily in Route Handlers since it relies on cookies sometimes.
    // Let's implement active business resolution securely.
    // Get the most recently accessed business or default
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

    let csvData = "";
    let filename = "";

    if (type === "private") {
        const { data: feedback } = await supabase
            .from("private_feedback")
            .select(`
                id,
                rating,
                message,
                created_at,
                review_requests (
                    customer_name,
                    customer_email,
                    customer_phone
                )
            `)
            .eq("business_id", business.id)
            .order("created_at", { ascending: false });

        const formatted = (feedback || []).map((f: any) => ({
            "Date": new Date(f.created_at).toLocaleString(),
            "Rating": f.rating,
            "Message": f.message,
            "Customer Name": f.review_requests?.customer_name || "Anonymous",
            "Customer Email": f.review_requests?.customer_email || "",
            "Customer Phone": f.review_requests?.customer_phone || ""
        }));

        csvData = Papa.unparse(formatted);
        filename = `${business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_private_feedback.csv`;
    } else {
        const { data: reviews } = await supabase
            .from("reviews")
            .select(`
                id,
                rating,
                content,
                author_name,
                sentiment,
                published_at,
                response_status,
                review_platforms (
                    platform
                )
            `)
            .eq("business_id", business.id)
            .order("published_at", { ascending: false });

        const formatted = (reviews || []).map((r: any) => ({
            "Date": new Date(r.published_at || r.created_at).toLocaleString(),
            "Rating": r.rating,
            "Author": r.author_name || "Anonymous",
            "Platform": r.review_platforms?.platform || "Direct",
            "Content": r.content || "",
            "Sentiment": r.sentiment || "",
            "Response Status": r.response_status || "pending"
        }));

        csvData = Papa.unparse(formatted);
        filename = `${business.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_public_reviews.csv`;
    }

    return new NextResponse(csvData, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
