import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ChannelBadge,
    StatusBadge,
    formatReviewRequestContact,
    getRequestStatus,
    type ReviewRequestRow,
} from "./review-requests-page-utils";

export function ReviewRequestsListSection({ filteredRequests }: { filteredRequests: ReviewRequestRow[] }) {
    return (
        <>
            <div className="space-y-3 lg:hidden">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                        const status = getRequestStatus(req.opened_at, req.clicked_at, req.completed_at);
                        return (
                            <div
                                key={req.id}
                                className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="break-words font-semibold text-foreground">
                                        {req.customer_name || "Unknown"}
                                    </p>
                                    <StatusBadge status={status} />
                                </div>
                                <p className="mt-1 break-all text-sm text-muted-foreground">
                                    {formatReviewRequestContact(req)}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                                    <ChannelBadge channel={req.channel} />
                                    <span className="text-xs text-muted-foreground">
                                        {req.sent_at
                                            ? formatDistanceToNow(new Date(req.sent_at), { addSuffix: true })
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                        No review requests with this status yet.
                    </div>
                )}
            </div>
            <Card className="hidden lg:block">
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
                                                    {formatReviewRequestContact(req)}
                                                </TableCell>
                                                <TableCell>
                                                    <ChannelBadge channel={req.channel} />
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {req.sent_at
                                                        ? formatDistanceToNow(new Date(req.sent_at), {
                                                              addSuffix: true,
                                                          })
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-xs">
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
    );
}
