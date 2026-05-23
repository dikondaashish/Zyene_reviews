import { createClient } from "@/lib/db/supabase/server";
import {
    buildCustomerTimeline,
    computeDetailStats,
    filterFeedbackForCustomer,
    filterRequestsForCustomer,
    type TimelinePlatformReviewItem,
} from "@/lib/customers/customer-detail-data";

export async function loadCustomerDetailPageData(customerId: string, businessId: string) {
    const supabase = await createClient();

    const { data: customer, error: custErr } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .eq("business_id", businessId)
        .maybeSingle();

    if (custErr || !customer) {
        return { kind: "not-found" as const };
    }

    const [{ data: reqRows }, { data: pfRows }] = await Promise.all([
        supabase
            .from("review_requests")
            .select("*")
            .eq("business_id", businessId)
            .order("sent_at", { ascending: false, nullsFirst: false })
            .limit(8000),
        supabase
            .from("private_feedback")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .limit(5000),
    ]);

    const matchedRequests = filterRequestsForCustomer(customer, reqRows ?? []);
    const matchedFeedback = filterFeedbackForCustomer(customer, pfRows ?? []);
    const baseTimeline = buildCustomerTimeline(matchedRequests, matchedFeedback);

    const displayFull = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim().toLowerCase();
    const { data: reviewRows } = await supabase
        .from("reviews")
        .select("id, rating, platform, review_date, text, author_name")
        .eq("business_id", businessId)
        .eq("is_visible", true)
        .order("review_date", { ascending: false })
        .limit(500);

    const platformTimeline =
        displayFull.length > 0
            ? (reviewRows ?? []).reduce<TimelinePlatformReviewItem[]>((acc, r) => {
                  if (
                      r.author_name &&
                      r.author_name.trim().toLowerCase() === displayFull
                  ) {
                      acc.push({
                          type: "platform_review",
                          id: r.id,
                          sortAt: r.review_date,
                          rating: r.rating,
                          platform: r.platform,
                          text: r.text,
                      });
                  }
                  return acc;
              }, [])
            : [];

    const timeline = [...baseTimeline, ...platformTimeline].sort(
        (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime()
    );
    const stats = computeDetailStats(customer, matchedRequests, matchedFeedback);

    return {
        kind: "ok" as const,
        customer,
        timeline,
        stats,
    };
}
