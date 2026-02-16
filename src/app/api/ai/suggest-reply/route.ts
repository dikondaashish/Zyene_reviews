import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@/lib/ai/client";
import { REPLY_PROMPT } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reviewId } = await request.json();
    if (!reviewId) return NextResponse.json({ error: "Review ID required" }, { status: 400 });

    // Fetch review and business name
    const { data: review, error } = await supabase
        .from("reviews")
        .select(`
            *,
            businesses!inner(
                name,
                organizations!inner(
                    organization_members!inner(user_id)
                )
            )
        `)
        .eq("id", reviewId)
        .eq("businesses.organizations.organization_members.user_id", user.id)
        .single();

    if (error || !review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    try {
        // @ts-ignore
        const businessName = review.businesses?.name || "our business";
        const prompt = REPLY_PROMPT
            .replace("{business_name}", businessName)
            .replace("{rating}", review.rating.toString())
            .replace("{text}", review.content || "");

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : "";
        const jsonMatch = content.match(/\{[\s\S]*\}/); // Extract JSON
        const jsonStr = jsonMatch ? jsonMatch[0] : content;

        const result = JSON.parse(jsonStr);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("AI Reply Suggestion Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
