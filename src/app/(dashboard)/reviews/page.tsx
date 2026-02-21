import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReviewCard } from "@/components/reviews/review-card";
import { PrivateFeedbackCard } from "@/components/reviews/private-feedback-card";
import { ReviewsFilters } from "@/components/reviews/reviews-filters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Filter, MessageSquare, Lock } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { getActiveBusinessId } from "@/lib/business-context";

export default async function ReviewsPage(props: {
    searchParams: Promise<{ status?: string; rating?: string; sort?: string; page?: string; type?: string }>;
}) {
    const searchParams = await props.searchParams;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get active business from context
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-xl font-semibold">No Business Found</h2>
                <p className="text-muted-foreground">Please complete onboarding.</p>
            </div>
        );
    }

    const type = searchParams.type || "public";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Always fetch both counts for tab labels
    const [{ count: publicCount }, { count: privateCount }] = await Promise.all([
        supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("business_id", businessId),
        supabase
            .from("private_feedback")
            .select("*", { count: "exact", head: true })
            .eq("business_id", businessId),
    ]);

    let reviews = [], count = 0;
    let totalPages = 0;

    if (type === "private") {
        // Fetch Private Feedback
        const { data, count: totalCount } = await supabase
            .from("private_feedback")
            .select(`
                *,
                review_requests (
                    customer_name,
                    customer_email,
                    customer_phone
                )
            `, { count: "exact" })
            .eq("business_id", businessId)
            .order("created_at", { ascending: false })
            .range(from, to);

        // @ts-ignore
        reviews = data || [];
        count = totalCount || 0;
    } else {
        // Fetch Public Reviews
        let query = supabase
            .from("reviews")
            .select("*", { count: "exact" })
            .eq("business_id", businessId);

        // Filters
        const statusRaw = searchParams.status || "all";
        const statusMap: Record<string, string> = {
            "needs_response": "pending",
            "responded": "responded",
            "ignored": "ignored"
        };

        if (statusRaw !== "all" && statusMap[statusRaw]) {
            query = query.eq("response_status", statusMap[statusRaw]);
        }

        const rating = searchParams.rating;
        if (rating && rating !== "all") {
            query = query.eq("rating", parseInt(rating));
        }

        // Sort
        const sort = searchParams.sort || "newest";
        if (sort === "newest") query = query.order("published_at", { ascending: false });
        else if (sort === "oldest") query = query.order("published_at", { ascending: true });
        else if (sort === "lowest") query = query.order("rating", { ascending: true });
        else if (sort === "highest") query = query.order("rating", { ascending: false });

        query = query.range(from, to);

        const { data, count: totalCount } = await query;
        reviews = data || [];
        count = totalCount || 0;
    }

    totalPages = count ? Math.ceil(count / pageSize) : 0;

    // Helper URLs for Pagination
    const getPageUrl = (newPage: number) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", newPage.toString());
        return `/reviews?${params.toString()}`;
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        Reviews
                        <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                            {count || 0}
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage and respond to your customer reviews.</p>
                </div>
                <div className="flex gap-2">
                    <SyncButton />
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center">
                <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <Link href="/reviews?type=public">
                        <div className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${type === 'public' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                            Public Reviews ({publicCount || 0})
                        </div>
                    </Link>
                    <Link href="/reviews?type=private">
                        <div className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${type === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                            Private Feedback ({privateCount || 0})
                            <Lock className="w-3 h-3" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Content */}
            {type === "public" ? (
                <>
                    <ReviewsFilters />
                    <div className="grid gap-4">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review: any) => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-gray-50/50 border-dashed">
                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
                                <p className="text-muted-foreground max-w-sm mt-1 mb-6">
                                    Try adjusting your filters or sync your reviews.
                                </p>
                                <SyncButton />
                            </div>
                        )}
                    </div>
                </>
            ) : (
                // Private Feedback List
                <div className="grid gap-4">
                    {reviews && reviews.length > 0 ? (
                        reviews.map((feedback: any) => (
                            <PrivateFeedbackCard key={feedback.id} feedback={feedback} />
                        ))
                    ) : (
                        <div className="text-center py-20 flex flex-col items-center justify-center border rounded-lg bg-gray-50/50 border-dashed">
                            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <Lock className="h-6 w-6 text-red-200" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No private feedback yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-1">
                                Negative feedback (1-3 stars) from your review flow will appear here privately.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 pb-8">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                        {page > 1 ? <Link href={getPageUrl(page - 1)}>Previous</Link> : <span>Previous</span>}
                    </Button>
                    <div className="text-sm flex items-center text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                        {page < totalPages ? <Link href={getPageUrl(page + 1)}>Next</Link> : <span>Next</span>}
                    </Button>
                </div>
            )}
        </div>
    );
}
