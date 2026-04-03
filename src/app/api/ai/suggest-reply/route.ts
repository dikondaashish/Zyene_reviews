import { createClient } from "@/lib/db/supabase/server";
import { anthropic } from "@/services/ai/client";
import { REPLY_PROMPT } from "@/services/ai/prompts";
import { NextResponse } from "next/server";
import { aiRateLimit } from "@/lib/auth/rate-limit";
import { checkLimit } from "@/lib/stripe/check-limits";

interface OrgWithPlan {
    plan: string;
    ai_replies_used_this_month: number;
}

interface ReviewWithBusiness {
    businesses: {
        organization_id: string;
        name: string;
    } | null;
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Apply Rate Limiting (20 AI replies/min per user)
    const { success: rateLimitSuccess } = await aiRateLimit.limit(user.id);
    if (!rateLimitSuccess) {
        return NextResponse.json({ error: "AI rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const { reviewId } = await request.json();
    if (!reviewId) return NextResponse.json({ error: "Review ID required" }, { status: 400 });

    // Fetch review with business and org info for ownership + limit check
    const { data: review, error } = await supabase
        .from("reviews")
        .select(`
            *,
            businesses!inner(
                name,
                organization_id,
                organizations!inner(
                    id,
                    organization_members!inner(user_id)
                )
            )
        `)
        .eq("id", reviewId)
        .eq("businesses.organizations.organization_members.user_id", user.id)
        .single();

    if (error || !review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Extract org info for limit check and business name
    const reviewTyped = review as unknown as ReviewWithBusiness;
    const orgId = reviewTyped.businesses?.organization_id;
    if (!orgId) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // Check AI reply limits using the centralized limit checker
    const aiLimitCheck = await checkLimit(orgId, "ai_replies");
    if (!aiLimitCheck.allowed) {
        return NextResponse.json(
            { error: "Monthly AI reply limit reached. Please upgrade your plan." },
            { status: 403 }
        );
    }

    try {
        const businessName = reviewTyped.businesses?.name || "our business";
        const prompt = REPLY_PROMPT
            .replace("{business_name}", businessName)
            .replace("{rating}", review.rating.toString())
            .replace("{text}", review.text || "");

        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;

        let result;
        try {
            result = JSON.parse(jsonStr);
        } catch (err) {
            console.error("[suggest-reply] AI returned invalid JSON:", content);
            return NextResponse.json(
                { reply: content, tone: "professional" },
                { status: 200 }
            );
        }

        // After successful Claude call, increment the counter atomically:
        await supabase.rpc("increment_ai_replies_used", { org_id: orgId });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("AI Reply Suggestion Failed:", error);
        return NextResponse.json(
            { error: "Failed to generate AI reply. Please try again." },
            { status: 500 }
        );
    }
}
