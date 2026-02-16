import { createClient } from "@/lib/supabase/server";
import { analyzeReview } from "@/lib/ai/analysis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await request.json();
    if (!reviewId) return NextResponse.json({ error: "Review ID required" }, { status: 400 });

    const { data: review } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", reviewId)
        .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const result = await analyzeReview(review);

    return NextResponse.json({ success: true, analysis: result });
}
