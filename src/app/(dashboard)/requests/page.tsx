
import { createClient } from "@/lib/db/supabase/server";
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

    const [
        totalSentRes,
        deliveredRes,
        clickedRes,
        reviewsRes,
        listRes,
    ] = await Promise.all([
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id),
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("status", "delivered"),
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .or("status.eq.clicked,review_left.eq.true"),
        supabase
            .from("review_requests")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id)
            .eq("review_left", true),
        supabase
            .from("review_requests")
            .select("*")
            .eq("business_id", business.id)
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
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
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
                phone: customerData.phone || ""
            };
        }
    }


    // Badge helper
    const getStatusBadge = (status: string, reviewLeft: boolean) => {
        if (reviewLeft) return <Badge className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/15 border-chart-4/35"><Star className="w-3 h-3 mr-1 fill-chart-4 text-chart-4" /> Review Left</Badge>;

        switch (status) {
            case "queued": return <Badge variant="secondary" className="bg-muted text-muted-foreground">Queued</Badge>;
            case "sent": return <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">Sent</Badge>;
            case "delivered": return <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/15 border-chart-2/30">Delivered</Badge>;
            case "clicked": return <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/30">Clicked</Badge>;
            case "failed": return <Badge variant="destructive">Failed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Review Requests</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your review invitations.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <a href={`/api/requests/export`}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </a>
                    </Button>
                    <SendRequestDialog
                        businessId={business.id}
                        businessSlug={business.slug || ""}
                        businessName={business.name || ""}
                        initialCustomer={initialCustomer}
                        autoOpen={!!initialCustomer}
                    />
                </div>
            </div>

            {/* STATS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                            {reviews} reviews left
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* LIST */}
            <div className="rounded-md border bg-card">
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
                                <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{req.customer_name || "Guest"}</TableCell>
                                    <TableCell>{req.customer_phone}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {req.channel === 'sms' ? <MessageSquare className="w-3 h-3 mr-2 text-muted-foreground" /> : <Mail className="w-3 h-3 mr-2 text-muted-foreground" />}
                                            <span className="uppercase text-xs font-medium text-muted-foreground">{req.channel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(req.status, req.review_left)}
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                    {page > 1 ? <Link href={`/requests?page=${page - 1}${sp.customer ? `&customer=${sp.customer}` : ''}`}>Previous</Link> : <span>Previous</span>}
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button variant="outline" size="sm" disabled={!requests || requests.length < pageSize} asChild>
                    {requests && requests.length >= pageSize ? <Link href={`/requests?page=${page + 1}${sp.customer ? `&customer=${sp.customer}` : ''}`}>Next</Link> : <span>Next</span>}
                </Button>
            </div>
        </div>
    );
}
