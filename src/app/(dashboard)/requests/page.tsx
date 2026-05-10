
import { createClient } from "@/lib/db/supabase/server";
import { createAdminClient } from "@/lib/db/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Send,
    MessageSquare,
    MousePointerClick,
    Star,
    AlertCircle,
    CheckCircle2,
    Clock,
    Mail,
    Download
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SendRequestDialog } from "./send-request-dialog";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { DashboardFetchError } from "@/components/dashboard/dashboard-fetch-error";

function formatReviewRequestContact(req: {
    customer_phone?: string | null;
    customer_email?: string | null;
}) {
    return [req.customer_phone, req.customer_email].filter(Boolean).join(" · ") || "—";
}

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; customer?: string }>;
}) {
    const sp = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Get active business from context
    const { business, organization } = await getActiveBusinessId();

    if (!business) {
        return <div>Business not found. Please contact support.</div>;
    }

    // --- STATS + LIST (parallel) ---
    const page = Number(sp.page) || 1;
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // PostgREST: chained `.or()` becomes multiple `or=` params and does NOT mean (A AND B).
    // Use one `or=(and(...))` so stats match: outbound AND (click or delivery) predicates.
    const outboundRequestFilter =
        "customer_phone.not.is.null,customer_email.not.is.null,customer_name.not.is.null,campaign_id.not.is.null";
    // Clicks: opened the link, or already converted (counts toward conversion denominator even if click row lagged).
    const clickedOrConverted =
        "clicked_at.not.is.null,status.eq.clicked,review_left.eq.true,completed_at.not.is.null,status.eq.completed,status.eq.feedback_left";
    const outboundAndClicked = `and(or(${outboundRequestFilter}),or(${clickedOrConverted}))`;
    const outboundAndDelivered = `and(or(${outboundRequestFilter}),delivered_at.not.is.null)`;
    // Completed Google flow sets status + completed_at but historically omitted review_left; include both.
    const completedOrReviewLeft =
        "review_left.eq.true,completed_at.not.is.null,status.eq.completed,status.eq.feedback_left";
    const outboundAndConverted = `and(or(${outboundRequestFilter}),or(${completedOrReviewLeft}))`;

    const admin = createAdminClient();

    const [
        totalSentRes,
        deliveredRes,
        clickedRes,
        reviewsRes,
        listRes,
    ] = await Promise.all([
        admin
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .or(outboundRequestFilter),
        admin
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .or(outboundAndDelivered),
        admin
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .or(outboundAndClicked),
        admin
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .or(outboundAndConverted),
        supabase
            .from("review_requests")
            .select("*")
            .eq("business_id", business.id)
            .or(outboundRequestFilter)
            .order("created_at", { ascending: false })
            .range(from, to),
    ]);

    const statsOrListError =
        totalSentRes.error ||
        deliveredRes.error ||
        clickedRes.error ||
        reviewsRes.error ||
        listRes.error;

    if (statsOrListError) {
        console.error("[Requests page] Fetch failed:", statsOrListError);
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-8">
                <DashboardFetchError
                    message="We could not load review requests. Check your connection and try again."
                    retryHref="/requests"
                />
            </div>
        );
    }

    const totalSent = totalSentRes.count;
    const delivered = deliveredRes.count;
    const clicked = clickedRes.count;
    const reviews = reviewsRes.count;
    const requests = listRes.data ?? [];

    const safeTotal = totalSent || 0;
    const deliveryRate = safeTotal > 0 ? ((delivered || 0) / safeTotal) * 100 : 0;
    const clickRate = safeTotal > 0 ? ((clicked || 0) / safeTotal) * 100 : 0;
    const safeClicked = clicked || 0;
    const conversionRate = safeClicked > 0 ? ((reviews || 0) / safeClicked) * 100 : 0;


    // Initial customer pre-fill if we navigated from the Customers page
    const customerId = sp.customer;
    let initialCustomer = undefined;

    if (customerId) {
        const { data: customerData } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single();

        if (customerData) {
            initialCustomer = {
                name: `${customerData.first_name || ""} ${customerData.last_name || ""}`.trim(),
                phone: customerData.phone || "",
                email: customerData.email || "",
            };
        }
    }


    const requestFlowCompleted = (req: {
        review_left?: boolean | null;
        completed_at?: string | null;
        status?: string | null;
    }) =>
        !!(
            req.review_left ||
            req.completed_at ||
            req.status === "completed" ||
            req.status === "feedback_left"
        );

    // Badge helper
    const getStatusBadge = (status: string, converted: boolean) => {
        if (converted) return <Badge className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/15 border-chart-4/35"><Star className="w-3 h-3 mr-1 fill-chart-4 text-chart-4" /> Review Left</Badge>;

        switch (status) {
            case "queued": return <Badge variant="secondary" className="bg-muted text-muted-foreground">Queued</Badge>;
            case "processing": return <Badge variant="secondary" className="bg-muted text-muted-foreground">Processing</Badge>;
            case "sent": return <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">Sent</Badge>;
            case "delivered": return <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/15 border-chart-2/30">Delivered</Badge>;
            case "clicked": return <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/30">Clicked</Badge>;
            case "failed": return <Badge variant="destructive">Failed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-5 lg:p-8 lg:pt-8">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Review Requests</h1>
                    <p className="mt-1 text-sm text-muted-foreground lg:text-base">
                        Manage and track your review invitations.
                    </p>
                </div>
                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:shrink-0">
                    <Button variant="outline" className="min-w-0 flex-1 sm:flex-initial" asChild>
                        <a href={`/api/requests/export`} className="inline-flex items-center justify-center gap-2">
                            <Download className="h-4 w-4 shrink-0" />
                            <span className="md:hidden">Export</span>
                            <span className="hidden md:inline">Export CSV</span>
                        </a>
                    </Button>
                    <div className="min-w-0 flex-1 max-lg:[&_button]:w-full sm:flex-initial lg:[&_button]:w-auto">
                    <SendRequestDialog
                        businessId={business.id}
                        businessSlug={business.slug || ""}
                        businessName={business.name || ""}
                        initialCustomer={initialCustomer}
                        autoOpen={!!initialCustomer}
                    />
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <Send className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSent}</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {delivered} delivered
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-600">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-chart-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clickRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {clicked} clicks
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Review Conversion</CardTitle>
                        <Star className="h-4 w-4 text-chart-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {reviews} completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* LIST */}
            <div className="space-y-3 lg:hidden">
                {requests && requests.length > 0 ? (
                    requests.map((req) => {
                        const contact = formatReviewRequestContact(req);
                        return (
                            <div
                                key={req.id}
                                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold leading-snug break-words">
                                            {req.customer_name || "Guest"}
                                        </p>
                                        <p className="mt-1 break-all text-xs text-muted-foreground">{contact}</p>
                                    </div>
                                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                                        {req.created_at
                                            ? formatDistanceToNow(new Date(req.created_at), { addSuffix: true })
                                            : "—"}
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        {req.channel === "sms" ? (
                                            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                        ) : (
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                        )}
                                        <span className="font-medium uppercase">{req.channel}</span>
                                    </div>
                                    <div className="ml-auto">{getStatusBadge(req.status, requestFlowCompleted(req))}</div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                        No requests sent yet.
                    </div>
                )}
            </div>
            <div className="hidden overflow-x-auto rounded-md border bg-card lg:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone / Email</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Sent At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests && requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id} className="transition-colors hover:bg-muted/50">
                                    <TableCell className="font-medium">{req.customer_name || "Guest"}</TableCell>
                                    <TableCell className="max-w-[240px] break-all text-muted-foreground">
                                        {formatReviewRequestContact(req)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {req.channel === 'sms' ? <MessageSquare className="w-3 h-3 mr-2 text-muted-foreground" /> : <Mail className="w-3 h-3 mr-2 text-muted-foreground" />}
                                            <span className="text-xs font-medium uppercase text-muted-foreground">{req.channel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(req.status, requestFlowCompleted(req))}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {req.created_at ? formatDistanceToNow(new Date(req.created_at), { addSuffix: true }) : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No requests sent yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Simple Pagination */}
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                <div className="flex items-center justify-center gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                        {page > 1 ? <Link href={`/requests?page=${page - 1}${sp.customer ? `&customer=${sp.customer}` : ''}`}>Previous</Link> : <span>Previous</span>}
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page}</span>
                    <Button variant="outline" size="sm" disabled={!requests || requests.length < pageSize} asChild>
                        {requests && requests.length >= pageSize ? <Link href={`/requests?page=${page + 1}${sp.customer ? `&customer=${sp.customer}` : ''}`}>Next</Link> : <span>Next</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
