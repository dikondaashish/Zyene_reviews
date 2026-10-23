import { MessageSquare, Mail, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isCompletedRequest } from "@/lib/metrics/business-metrics";

/** Phone and email on their own lines, each cut short with the full value on hover. */
export function ReviewRequestContactCell({ req }: { req: { customer_phone?: string | null; customer_email?: string | null } }) {
    const lines = [req.customer_phone, req.customer_email].filter((v): v is string => Boolean(v));
    if (lines.length === 0) return <span>-</span>;
    return (
        <div className="min-w-0 space-y-0.5">
            {lines.map((line) => <span key={line} title={line} className="block truncate">{line}</span>)}
        </div>
    );
}

export function reviewRequestChannelCell(channel: string | null | undefined) {
    const ch = (channel || "").toLowerCase();
    if (ch === "both") {
        return (
            <div className="flex items-center gap-1.5">
                <MessageSquare className="shrink-0 text-muted-foreground size-3" />
                <Mail className="shrink-0 text-muted-foreground size-3" />
                <span className="text-xs font-medium uppercase text-muted-foreground">
                    Both
                </span>
            </div>
        );
    }
    if (ch === "sms") {
        return (
            <div className="flex items-center gap-1.5">
                <MessageSquare className="shrink-0 text-muted-foreground size-3.5" />
                <span className="font-medium uppercase">{ch}</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5">
            <Mail className="shrink-0 text-muted-foreground size-3.5" />
            <span className="font-medium uppercase">{ch || "-"}</span>
        </div>
    );
}

export function requestFlowCompleted(req: {
    review_left?: boolean | null;
    completed_at?: string | null;
    status?: string | null;
}) {
    return isCompletedRequest(req);
}

/** Progress the customer made (clicked, rated, finished): green, so only failures read as red. */
const GOOD_OUTCOME_BADGE = "border-chart-2/30 bg-chart-2/15 text-success";

export function getRequestStatusBadge(
    req: {
        status: string;
        channel?: string | null;
        email_status?: string | null;
        sms_status?: string | null;
        review_confirmed_at?: string | null;
        review_confirmation_source?: string | null;
    },
    converted: boolean,
) {
    // Only a confirmed review earns the star. Opening the link or being handed off to Google
    // is shown as what it is; we cannot see whether Google published a review.
    if (req.review_confirmed_at) {
        return (
            <Badge className="bg-chart-4/15 text-warning-foreground hover:bg-chart-4/15 border-chart-4/35">
                <Star className="mr-1 text-chart-4 size-3" />{" "}
                {req.review_confirmation_source === "manual" ? "Review confirmed (manual)" : "Review confirmed"}
            </Badge>
        );
    }
    if (converted) {
        const label = req.status === "feedback_left" ? "Private feedback" : req.status === "completed" ? "Sent to Google" : "Finished review page";
        return <Badge variant="outline" className={GOOD_OUTCOME_BADGE}>{label}</Badge>;
    }
    if (req.status === "skipped") return <Badge variant="outline" className="text-muted-foreground">Skipped</Badge>;
    if (req.status === "rated_positive" || req.status === "rated_negative") {
        return <Badge variant="outline" className={GOOD_OUTCOME_BADGE}>Rated</Badge>;
    }

    const status = req.status;
    const ch = (req.channel || "").toLowerCase();
    const e = req.email_status;
    const s = req.sms_status;

    if (status === "queued") {
        return (
            <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
            >
                Queued
            </Badge>
        );
    }
    if (status === "processing" || status === "sending") {
        return (
            <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
            >
                Processing
            </Badge>
        );
    }

    if (ch === "both" && (e || s)) {
        const emailLabel =
            e === "sent" ? "Email ✓" : e === "failed" ? "Email ✗" : null;
        const smsLabel =
            s === "sent" ? "SMS ✓" : s === "failed" ? "SMS ✗" : null;
        const allOk = e === "sent" && s === "sent";
        const allFailed = e === "failed" && s === "failed";

        if (allOk) {
            return (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                    Email + SMS Sent
                </Badge>
            );
        }
        if (allFailed) {
            return <Badge variant="destructive">Email + SMS Failed</Badge>;
        }
        return (
            <div className="flex flex-wrap items-center gap-1">
                {emailLabel && (
                    <Badge
                        variant="outline"
                        className={
                            e === "sent"
                                ? "border-chart-2/40 bg-chart-2/15 text-success"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                        }
                    >
                        {emailLabel}
                    </Badge>
                )}
                {smsLabel && (
                    <Badge
                        variant="outline"
                        className={
                            s === "sent"
                                ? "border-chart-2/40 bg-chart-2/15 text-success"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                        }
                    >
                        {smsLabel}
                    </Badge>
                )}
            </div>
        );
    }

    if (ch === "email" && e === "failed") {
        return <Badge variant="destructive">Email Failed</Badge>;
    }
    if (ch === "sms" && s === "failed") {
        return <Badge variant="destructive">SMS Failed</Badge>;
    }
    if (s === "undelivered") return <Badge variant="destructive">SMS not delivered</Badge>;
    if (e === "bounced" || e === "complained") return <Badge variant="destructive">{e === "bounced" ? "Email bounced" : "Marked as spam"}</Badge>;

    switch (status) {
        case "sent":
            return (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                    Sent
                </Badge>
            );
        case "delivered":
            return (
                <Badge className="bg-chart-2/15 text-success hover:bg-chart-2/15 border-chart-2/30">
                    Delivered
                </Badge>
            );
        case "clicked":
            return (
                <Badge variant="outline" className={GOOD_OUTCOME_BADGE}>
                    Clicked
                </Badge>
            );
        case "failed":
            return <Badge variant="destructive">Failed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
