import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client";
import { resolveGoogleMapsListingUrl } from "@/lib/google/maps-listing-url";
import { planAllowsAiReviewFeatures } from "@/services/stripe/plans";
import { BusinessContextEmptyState } from "@/components/dashboard/business-context-empty-state";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";
import { MessageSquareQuote } from "lucide-react";

export default async function ReviewsPage(props: {
    searchParams: Promise<{ status?: string; rating?: string; sort?: string; page?: string; type?: string }>;
}) {
    const searchParams = await props.searchParams;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business, organization } = await getActiveBusinessId();
    const autoCommenterPlanOk = planAllowsAiReviewFeatures(
        organization?.plan ?? null,
        (organization as { plan_status?: string | null } | null)?.plan_status ?? null
    );

    const isGoogleConnected = !!business?.review_platforms?.find((p: any) => p.platform === "google");
    const isDemo = !isGoogleConnected;

    if (!businessId) {
        return (
            <BusinessContextEmptyState
                icon={MessageSquareQuote}
                title="Add a business to see reviews"
                description="Review inbox, private feedback, and replies are tied to a business location. Create one or pick an existing business from the header."
            />
        );
    }

    const type = searchParams.type || "public";
    const page = parseInt(searchParams.page || "1");
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Fetch counts + initial data in parallel
    const [{ count: publicCount, error: publicCountErr }, { count: privateCount, error: privateCountErr }] =
        await Promise.all([
            supabase
                .from("reviews")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId)
                .eq("is_visible", true),
            supabase
                .from("private_feedback")
                .select("*", { count: "exact", head: true })
                .eq("business_id", businessId),
        ]);

    if (publicCountErr || privateCountErr) {
        console.error("[Reviews page] Count queries failed:", publicCountErr || privateCountErr);
        return (
            <div className="flex flex-col gap-6 h-full p-4 lg:p-6">
                <DashboardFetchError
                    message="We could not load review counts. Check your connection and try again."
                    retryHref="/reviews"
                />
            </div>
        );
    }

    let reviews: any[] = [];
    let count = 0;

    if (type === "private") {
        const { data, count: totalCount, error: listErr } = await supabase
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

        if (listErr) {
            console.error("[Reviews page] Failed to load private feedback:", listErr);
            return (
                <div className="flex flex-col gap-6 h-full p-4 lg:p-6">
                    <DashboardFetchError
                        message="We could not load private feedback. Check your connection and try again."
                        retryHref="/reviews"
                    />
                </div>
            );
        }

        reviews = data || [];
        count = totalCount || 0;
    } else {
        let query = supabase
            .from("reviews")
            .select("*", { count: "exact" })
            .eq("business_id", businessId)
            .eq("is_visible", true);

        const statusRaw = searchParams.status || "all";
        const statusMap: Record<string, string> = {
            "needs_response": "pending",
            "responded": "responded",
            "ignored": "ignored",
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

        query = query.range(from, to);

        const { data, count: totalCount, error } = await query;
        if (error) {
            console.error("[Reviews page] Failed to load reviews:", error);
            return (
                <div className="flex flex-col gap-6 h-full p-4 lg:p-6">
                    <DashboardFetchError
                        message="We could not load reviews. Check your connection and try again."
                        retryHref="/reviews"
                    />
                </div>
            );
        }
        reviews = data || [];
        count = totalCount || 0;
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    const googlePlatform = business?.review_platforms?.find(
        (p: { platform?: string }) => p.platform === "google"
    );
    const googleMapsListingUrl = resolveGoogleMapsListingUrl({
        googleReviewUrl:
            typeof business?.google_review_url === "string" ? business.google_review_url : null,
        platformExternalUrl:
            typeof googlePlatform?.external_url === "string" ? googlePlatform.external_url : null,
    });

    const autoReplyInitial = {
        auto_reply_enabled:
            autoCommenterPlanOk &&
            Boolean((business as { auto_reply_enabled?: boolean })?.auto_reply_enabled),
        auto_reply_min_rating: ((): 3 | 4 | 5 => {
            const r = (business as { auto_reply_min_rating?: number })?.auto_reply_min_rating;
            if (r === 3 || r === 4 || r === 5) return r;
            return 4;
        })(),
        auto_reply_tone: ((): "professional" | "friendly" | "concise" => {
            const t = (business as { auto_reply_tone?: string })?.auto_reply_tone;
            if (t === "friendly" || t === "concise" || t === "professional") return t;
            return "professional";
        })(),
    };

    return (
        <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden h-full">
            {isDemo && <DemoModeBanner className="mb-2" />}
            <ReviewsPageClient
                businessId={businessId as string}
                googleMapsListingUrl={googleMapsListingUrl}
                isDemo={isDemo}
                isGoogleConnected={isGoogleConnected}
                initialGoogleSyncStatus={
                    typeof googlePlatform?.sync_status === "string" ? googlePlatform.sync_status : null
                }
                initialGoogleLastSyncedAt={
                    typeof googlePlatform?.last_synced_at === "string" ? googlePlatform.last_synced_at : null
                }
                autoCommenterPlanOk={autoCommenterPlanOk}
                autoReplyInitial={autoReplyInitial}
                initialReviews={reviews}
                initialCount={count}
                initialTotalPages={totalPages}
                initialPage={page}
                initialPublicCount={publicCount || 0}
                initialPrivateCount={privateCount || 0}
                initialType={type}
                initialFilters={{
                    status: searchParams.status || "all",
                    rating: searchParams.rating || "all",
                    sort: searchParams.sort || "newest",
                }}
            />
        </div>
    );
}
