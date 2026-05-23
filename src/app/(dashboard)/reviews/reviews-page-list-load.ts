import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "@/components/reviews/private-feedback-card";
import type { ReviewsPageSearchParams } from "./load-reviews-page-data";

export async function loadReviewsPageList(
    businessId: string,
    searchParams: ReviewsPageSearchParams,
    from: number,
    to: number
): Promise<
    | { ok: false; message: string }
    | { ok: true; reviews: ReviewManagementItem[] | PrivateFeedback[]; count: number }
> {
    const supabase = await createClient();
    const type = searchParams.type || "public";

    if (type === "private") {
        const { data, count: totalCount, error: listErr } = await supabase
            .from("private_feedback")
            .select(
                `
                *,
                review_requests (
                    customer_name,
                    customer_email,
                    customer_phone
                )
            `,
                { count: "exact" }
            )
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (listErr) {
            logger.error({ err: listErr }, "[Reviews page] Failed to load private feedback:");
            return {
                ok: false,
                message: "We could not load private feedback. Check your connection and try again.",
            };
        }

        return { ok: true, reviews: data || [], count: totalCount || 0 };
    }

    let query = supabase
        .from("reviews")
        .select("*", { count: "exact" })
        .eq("business_id", businessId)
        .eq("is_visible", true);

    const statusRaw = searchParams.status || "all";
    const statusMap: Record<string, string> = {
        needs_response: "pending",
        responded: "responded",
        ignored: "ignored",
    };

    if (statusRaw !== "all" && statusMap[statusRaw]) {
        query = query.eq("response_status", statusMap[statusRaw]);
    }

    const rating = searchParams.rating;
    if (rating && rating !== "all") {
        query = query.eq("rating", parseInt(rating));
    }

    const sort = searchParams.sort || "newest";
    if (sort === "newest") query = query.order("review_date", { ascending: false });
    else if (sort === "oldest") query = query.order("review_date", { ascending: true });
    else if (sort === "lowest") query = query.order("rating", { ascending: true });
    else if (sort === "highest") query = query.order("rating", { ascending: false });

    const { data, count: totalCount, error } = await query.range(from, to);
    if (error) {
        logger.error({ err: error }, "[Reviews page] Failed to load reviews:");
        return {
            ok: false,
            message: "We could not load reviews. Check your connection and try again.",
        };
    }

    return { ok: true, reviews: data || [], count: totalCount || 0 };
}
