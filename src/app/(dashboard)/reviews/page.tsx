import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { SyncButton } from "@/components/dashboard/sync-button";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { Badge } from "@/components/ui/badge";
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client";

export default async function ReviewsPage(props: {
    searchParams: Promise<{ status?: string; rating?: string; sort?: string; page?: string; type?: string }>;
}) {
    const searchParams = await props.searchParams;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { businessId, business } = await getActiveBusinessId();

    const isGoogleConnected = !!business?.review_platforms?.find((p: any) => p.platform === "google");
    const isDemo = !isGoogleConnected;

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100">
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

    // Fetch counts + initial data in parallel
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

    let reviews: any[] = [];
    let count = 0;

    if (type === "private") {
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

        reviews = data || [];
        count = totalCount || 0;
    } else {
        let query = supabase
            .from("reviews")
            .select("*", { count: "exact" })
            .eq("business_id", businessId);

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
        }
        reviews = data || [];
        count = totalCount || 0;
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return (
        <div className="flex flex-col gap-6 h-full">
            {isDemo && <DemoModeBanner className="mb-2" />}
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        Reviews
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {count || 0}
                            </span>
                            {isDemo && (
                                <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:bg-orange-950/20 dark:border-orange-900/50 flex items-center gap-1 px-2.5 py-0.5 font-normal tracking-tight">
                                    <Eye className="w-3 h-3" />
                                    Interactive Demo
                                </Badge>
                            )}
                        </div>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage and respond to your customer reviews.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href={`/api/reviews/export?type=${type}`}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </a>
                    </Button>
                    <SyncButton />
                </div>
            </div>

            <ReviewsPageClient
                businessId={businessId as string}
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
