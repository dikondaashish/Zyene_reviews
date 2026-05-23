import { logger } from "@/lib/logger";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { getRequestStatus, type ReviewRequestRow } from "./review-requests-page-utils";

export type ReviewRequestsPageData =
    | { kind: "no-business" }
    | { kind: "error" }
    | {
          kind: "ok";
          filterStatus: string;
          requests: ReviewRequestRow[];
          totalSent: number;
          totalOpened: number;
          totalClicked: number;
          totalConverted: number;
          filteredRequests: ReviewRequestRow[];
      };

export async function loadReviewRequestsPageData(
    filterStatus: string
): Promise<ReviewRequestsPageData> {
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return { kind: "no-business" };
    }

    const supabase = await createClient();
    const { data: allRequests, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("sent_at", { ascending: false });

    if (error) {
        logger.error({ err: error }, "Error fetching review requests:");
        return { kind: "error" };
    }

    const requests = (allRequests || []) as ReviewRequestRow[];
    const totalSent = requests.length;
    const totalOpened = requests.filter((r) => r.opened_at).length;
    const totalClicked = requests.filter((r) => r.clicked_at).length;
    const totalConverted = requests.filter((r) => r.completed_at).length;

    const filteredRequests =
        filterStatus === "all"
            ? requests
            : requests.filter(
                  (r) => getRequestStatus(r.opened_at, r.clicked_at, r.completed_at) === filterStatus
              );

    return {
        kind: "ok",
        filterStatus,
        requests,
        totalSent,
        totalOpened,
        totalClicked,
        totalConverted,
        filteredRequests,
    };
}
