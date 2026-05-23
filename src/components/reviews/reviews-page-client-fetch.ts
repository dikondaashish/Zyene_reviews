import type { ReviewManagementItem } from "@/types/components";
import type { PrivateFeedback } from "./private-feedback-card";

export async function fetchReviewsPageData(params: {
    type: string;
    status: string;
    rating: string;
    sort: string;
    page: number;
}) {
    const searchParams = new URLSearchParams();
    searchParams.set("type", params.type);
    if (params.status !== "all") searchParams.set("status", params.status);
    if (params.rating !== "all") searchParams.set("rating", params.rating);
    if (params.sort !== "newest") searchParams.set("sort", params.sort);
    searchParams.set("page", params.page.toString());

    const res = await fetch(`/api/reviews?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const data = await res.json();

    const url = new URL(window.location.href);
    url.searchParams.set("type", params.type);
    if (params.status !== "all") url.searchParams.set("status", params.status);
    else url.searchParams.delete("status");
    if (params.rating !== "all") url.searchParams.set("rating", params.rating);
    else url.searchParams.delete("rating");
    if (params.sort !== "newest") url.searchParams.set("sort", params.sort);
    else url.searchParams.delete("sort");
    url.searchParams.set("page", params.page.toString());
    window.history.replaceState(null, "", url.toString());

    return data as {
        reviews: ReviewManagementItem[] | PrivateFeedback[];
        count: number;
        totalPages: number;
        page: number;
        publicCount: number;
        privateCount: number;
    };
}
