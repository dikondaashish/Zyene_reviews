import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    ReviewRequestContactCell,
    getRequestStatusBadge,
    requestFlowCompleted,
    reviewRequestChannelCell,
} from "./requests-page-display";
import { RequestOutcomeNote, RequestReviewConfirmButton } from "./request-review-confirm-button";

export type RequestListRow = {
    id: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    channel?: string | null;
    status: string;
    email_status?: string | null;
    sms_status?: string | null;
    created_at?: string | null;
    review_left?: boolean | null;
    completed_at?: string | null;
    review_confirmed_at?: string | null;
    review_confirmation_source?: "manual" | "matched" | null;
    error_message?: string | null;
    deferred_reason?: string | null;
};

export function RequestsListSection({
    requests,
    page,
    pageSize,
    customerQuery,
}: {
    requests: RequestListRow[];
    page: number;
    pageSize: number;
    customerQuery?: string;
}) {
    const customerSuffix = customerQuery ? `&customer=${customerQuery}` : "";

    // Switch on the list's own width, not the screen's: with the sidebar open, a laptop screen
    // has too little room for six columns, so it keeps the card layout until the table fits.
    return (
        <div className="@container">
            <div className="space-y-3 @[54rem]:hidden">
                {requests.length > 0 ? (
                    requests.map((req) => {
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
                                        <div className="mt-1 text-xs text-muted-foreground"><ReviewRequestContactCell req={req} /></div>
                                    </div>
                                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                                        {req.created_at
                                            ? formatDistanceToNow(new Date(req.created_at), { addSuffix: true })
                                            : "-"}
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        {reviewRequestChannelCell(req.channel)}
                                    </div>
                                    <div className="ml-auto text-right">
                                        {getRequestStatusBadge(req, requestFlowCompleted(req))}
                                        <RequestOutcomeNote req={req} />
                                        <RequestReviewConfirmButton requestId={req.id} confirmedSource={req.review_confirmation_source} status={req.status} />
                                    </div>
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
            <div className="hidden overflow-x-auto rounded-md border bg-card @[54rem]:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone / Email</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead className="text-right">Sent At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id} className="transition-colors hover:bg-muted/50">
                                    <TableCell className="font-medium">{req.customer_name || "Guest"}</TableCell>
                                    <TableCell className="max-w-[220px] text-muted-foreground">
                                        <ReviewRequestContactCell req={req} />
                                    </TableCell>
                                    <TableCell>{reviewRequestChannelCell(req.channel)}</TableCell>
                                    <TableCell>
                                        {getRequestStatusBadge(req, requestFlowCompleted(req))}
                                        <RequestOutcomeNote req={req} />
                                    </TableCell>
                                    <TableCell>
                                        <RequestReviewConfirmButton requestId={req.id} confirmedSource={req.review_confirmation_source} status={req.status} />
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {req.created_at
                                            ? formatDistanceToNow(new Date(req.created_at), { addSuffix: true })
                                            : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No requests sent yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                <div className="flex items-center justify-center gap-2 sm:justify-end">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                        {page > 1 ? (
                            <Link href={`/requests?page=${page - 1}${customerSuffix}`}>Previous</Link>
                        ) : (
                            <span>Previous</span>
                        )}
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {page}</span>
                    <Button variant="outline" size="sm" disabled={requests.length < pageSize} asChild>
                        {requests.length >= pageSize ? (
                            <Link href={`/requests?page=${page + 1}${customerSuffix}`}>Next</Link>
                        ) : (
                            <span>Next</span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
