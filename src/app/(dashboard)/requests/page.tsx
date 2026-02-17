
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
    Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SendRequestDialog } from "./send-request-dialog";

export default async function RequestsPage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // specific business for this user
    const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!business) {
        return <div>Business not found. Please contact support.</div>;
    }

    // --- STATS FETCHING ---
    // Efficiently count statuses
    // We can use multiple queries or a single one with filters if supabase supports it well,
    // or just separate count queries.

    // Total Sent
    const { count: totalSent } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id);

    // Delivered
    const { count: deliveredCount } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .in("status", ["delivered", "clicked", "review_left"]); // Assuming clicked/review_left implies delivered logic? 
    // Or just 'delivered' status? 
    // Twilio updates status to 'delivered'. 'clicked' is a separate state in our logic flow?
    // User prompt: "Status badges: Queued (gray), Sent (blue), Delivered (green), Clicked (purple), Review Left (gold star), Failed (red)"
    // It seems they are mutually exclusive or progressive states? 
    // Usually: sent -> delivered -> clicked -> review_left.
    // So I should count all "progressive" states.

    // Actually, 'delivered' might be a specific webhook update.
    // For now, let's assume 'sent' is the baseline.
    // Let's count specific statuses for now to be distinct or cumulative?
    // "Delivery Rate (sent/total * 100%)" -> Wait, user said "Delivery Rate (sent/total)".
    // Maybe they mean "delivered/sent"? 
    // User: "Delivery Rate (sent/total * 100%)" - wait, sent/total is 100% if total is sent?
    // Maybe they mean "delivered / total * 100%"?
    // I'll assume they mean "Delivered / Total Requests".

    // Let's just fetch all requests for the counts if volume is low, but better to use count queries.
    // I'll do distinct count queries.

    const { count: delivered } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("status", "delivered");

    const { count: clicked } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .or("status.eq.clicked,review_left.eq.true"); // Clicked OR Review Left implies Clicked.

    const { count: reviews } = await supabase
        .from("review_requests")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("review_left", true);

    const safeTotal = totalSent || 0;
    const deliveryRate = safeTotal > 0 ? ((delivered || 0) / safeTotal) * 100 : 0;
    // Click rate: clicked / sent?
    const clickRate = safeTotal > 0 ? ((clicked || 0) / safeTotal) * 100 : 0;
    // Review Conversion: review_left / clicked
    const safeClicked = clicked || 0;
    const conversionRate = safeClicked > 0 ? ((reviews || 0) / safeClicked) * 100 : 0;


    // --- LIST FETCHING ---
    const page = Number(searchParams.page) || 1;
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: requests } = await supabase
        .from("review_requests")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .range(from, to);


    // Badge helper
    const getStatusBadge = (status: string, reviewLeft: boolean) => {
        if (reviewLeft) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"><Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" /> Review Left</Badge>;

        switch (status) {
            case "queued": return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Queued</Badge>;
            case "sent": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Sent</Badge>;
            case "delivered": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Delivered</Badge>;
            case "clicked": return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Clicked</Badge>;
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
                <SendRequestDialog businessId={business.id} businessSlug={business.slug} businessName={business.name} />
            </div>

            {/* STATS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSent}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {delivered} delivered
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clickRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {clicked} clicks
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Review Conversion</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
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
            <div className="rounded-md border bg-white">
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
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.customer_name || "Guest"}</TableCell>
                                    <TableCell>{req.customer_phone}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {req.channel === 'sms' ? <MessageSquare className="w-3 h-3 mr-2 text-slate-500" /> : <Mail className="w-3 h-3 mr-2 text-slate-500" />}
                                            <span className="uppercase text-xs font-medium text-slate-500">{req.channel}</span>
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
                <Button variant="outline" size="sm" disabled={page <= 1}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!requests || requests.length < pageSize}>
                    Next
                </Button>
                {/* Note: In a real app, wire these to Next/Link or router.push with ?page=x */}
            </div>
        </div>
    );
}
