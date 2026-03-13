import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusinessId } from "@/lib/business-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Send,
    MessageSquare,
    Mail,
    Eye,
    MousePointer2,
    CheckCircle2,
    Inbox,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface ReviewRequest {
    id: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    channel: string;
    sent_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    completed_at: string | null;
    status: string;
}

// Helper function to determine status with better logic
function getRequestStatus(
    opened_at: string | null,
    clicked_at: string | null,
    completed_at: string | null
): string {
    if (completed_at) return "converted";
    if (clicked_at) return "clicked";
    if (opened_at) return "opened";
    return "pending";
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
        pending: { label: "Pending", variant: "outline" },
        opened: { label: "Opened", variant: "secondary" },
        clicked: { label: "Clicked", variant: "default" },
        converted: { label: "Converted", variant: "default" },
    };
    const config_item = config[status] || config.pending;
    return <Badge variant={config_item.variant}>{config_item.label}</Badge>;
}

// Channel Badge Component
function ChannelBadge({ channel }: { channel: string }) {
    const config: Record<string, { label: string; icon: any; color: string }> = {
        sms: {
            label: "SMS",
            icon: MessageSquare,
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        },
        email: {
            label: "Email",
            icon: Mail,
            color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        },
    };
    const config_item = config[channel] || config.email;
    const IconComponent = config_item.icon;
    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config_item.color}`}>
            <IconComponent className="w-3 h-3" />
            {config_item.label}
        </div>
    );
}

export default async function ReviewRequestsPage(props: {
    searchParams: Promise<{ status?: string }>;
}) {
    const searchParams = await props.searchParams;
    const filterStatus = searchParams.status || "all";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Get active business from context
    const { businessId } = await getActiveBusinessId();

    if (!businessId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-100">
                <h2 className="text-xl font-semibold">No Business Found</h2>
                <p className="text-muted-foreground">Please complete onboarding.</p>
            </div>
        );
    }

    // Fetch all review requests for this business
    const { data: allRequests, error } = await supabase
        .from("review_requests")
        .select("*")
        .eq("business_id", businessId)
        .order("sent_at", { ascending: false });

    if (error) {
        console.error("Error fetching review requests:", error);
    }

    const requests = (allRequests || []) as ReviewRequest[];

    // Calculate stats from all requests
    const totalSent = requests.length;
    const totalOpened = requests.filter((r) => r.opened_at).length;
    const totalClicked = requests.filter((r) => r.clicked_at).length;
    const totalConverted = requests.filter((r) => r.completed_at).length;

    // Filter requests based on status tab
    let filteredRequests = requests;
    if (filterStatus !== "all") {
        filteredRequests = requests.filter((r) => {
            const status = getRequestStatus(r.opened_at, r.clicked_at, r.completed_at);
            return status === filterStatus;
        });
    }

    // Helper to get URL with tab filter
    const getTabUrl = (status: string) => {
        if (status === "all") {
            return "/review-requests";
        }
        return `/review-requests?status=${status}`;
    };

    const isEmpty = totalSent === 0;

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        Review Requests
                        <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                            {totalSent || 0}
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track all review requests sent to your customers.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/campaigns">
                        <Send className="w-4 h-4 mr-2" />
                        Create Campaign
                    </Link>
                </Button>
            </div>

            {!isEmpty && (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                                <Send className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalSent}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Review requests sent
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Opened</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalOpened}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalSent > 0
                                        ? `${Math.round((totalOpened / totalSent) * 100)}% open rate`
                                        : "0% open rate"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Clicked</CardTitle>
                                <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalClicked}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalSent > 0
                                        ? `${Math.round((totalClicked / totalSent) * 100)}% click rate`
                                        : "0% click rate"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Converted</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalConverted}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalSent > 0
                                        ? `${Math.round((totalConverted / totalSent) * 100)}% conversion`
                                        : "0% conversion"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div>
                        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg inline-flex">
                            <Link href={getTabUrl("all")}>
                                <div
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        filterStatus === "all"
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                    }`}
                                >
                                    All ({totalSent})
                                </div>
                            </Link>
                            <Link href={getTabUrl("pending")}>
                                <div
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        filterStatus === "pending"
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                    }`}
                                >
                                    Pending ({totalSent - totalOpened})
                                </div>
                            </Link>
                            <Link href={getTabUrl("opened")}>
                                <div
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        filterStatus === "opened"
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                    }`}
                                >
                                    Opened ({totalOpened - totalClicked})
                                </div>
                            </Link>
                            <Link href={getTabUrl("clicked")}>
                                <div
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        filterStatus === "clicked"
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                    }`}
                                >
                                    Clicked ({totalClicked - totalConverted})
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer Name</TableHead>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Channel</TableHead>
                                            <TableHead>Sent At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRequests.length > 0 ? (
                                            filteredRequests.map((req) => {
                                                const status = getRequestStatus(
                                                    req.opened_at,
                                                    req.clicked_at,
                                                    req.completed_at
                                                );
                                                return (
                                                    <TableRow key={req.id}>
                                                        <TableCell className="font-medium">
                                                            {req.customer_name || "Unknown"}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                                            {req.channel === "sms"
                                                                ? req.customer_phone || "N/A"
                                                                : req.customer_email || "N/A"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <ChannelBadge channel={req.channel} />
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {req.sent_at
                                                                ? formatDistanceToNow(
                                                                    new Date(req.sent_at),
                                                                    { addSuffix: true }
                                                                )
                                                                : "—"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <StatusBadge status={status} />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-xs"
                                                            >
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={6}
                                                    className="text-center py-8 text-muted-foreground"
                                                >
                                                    No review requests with this status yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {isEmpty && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No review requests sent yet</h3>
                        <p className="text-muted-foreground text-center max-w-md mt-2">
                            Start sending review requests to customers to see them tracked here.
                        </p>
                        <Button asChild className="mt-6">
                            <Link href="/campaigns">
                                <Send className="w-4 h-4 mr-2" />
                                Create Your First Campaign
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
