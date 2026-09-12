import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "./private-feedback-card";

export async function fetchReviewsPageData(params: {
    type: string;
    status: string;
    rating: string;
    sort: string;
    q?: string;
    page: number;
}) {
    const searchParams = new URLSearchParams();
    searchParams.set("type", params.type);
    searchParams.set("status", params.status);
    if (params.q) searchParams.set("q", params.q);
    if (params.rating !== "all") searchParams.set("rating", params.rating);
    if (params.sort !== "newest") searchParams.set("sort", params.sort);
    searchParams.set("page", params.page.toString());

    const res = await fetch(`/api/reviews?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const data = await res.json();


    return data as {
        reviews: ReviewManagementItem[] | PrivateFeedback[];
        count: number;
        totalPages: number;
        page: number;
        publicCount: number;
        privateCount: number;
    };
}

/** Update navigation only after the caller accepts this response as current. */
export function updateReviewsPageUrl(params: Parameters<typeof fetchReviewsPageData>[0]) {
    const url = new URL(window.location.href);
    url.searchParams.set("type", params.type);
    url.searchParams.set("status", params.status);
    if (params.q) url.searchParams.set("q", params.q);
    else url.searchParams.delete("q");
    if (params.rating !== "all") url.searchParams.set("rating", params.rating);
    else url.searchParams.delete("rating");
    if (params.sort !== "newest") url.searchParams.set("sort", params.sort);
    else url.searchParams.delete("sort");
    url.searchParams.set("page", params.page.toString());
    window.history.replaceState(null, "", url.toString());

}
