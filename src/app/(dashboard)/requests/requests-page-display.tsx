import { MessageSquare, Mail, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isCompletedRequest } from "@/lib/metrics/business-metrics";

export function formatReviewRequestContact(req: {
    customer_phone?: string | null;
    customer_email?: string | null;
}) {
    return (
        [req.customer_phone, req.customer_email].filter(Boolean).join(" · ") ||
        ", "
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

export function getRequestStatusBadge(
    req: {
        status: string;
        channel?: string | null;
        email_status?: string | null;
        sms_status?: string | null;
    },
    converted: boolean,
) {
    if (converted) {
        return (
            <Badge className="bg-chart-4/15 text-chart-4 hover:bg-chart-4/15 border-chart-4/35">
                <Star className="mr-1 fill-chart-4 text-chart-4 size-3" />{" "}
                Review Left
            </Badge>
        );
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
                                ? "border-chart-2/40 bg-chart-2/15 text-chart-2"
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
                                ? "border-chart-2/40 bg-chart-2/15 text-chart-2"
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

    switch (status) {
        case "sent":
            return (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                    Sent
                </Badge>
            );
        case "delivered":
            return (
                <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/15 border-chart-2/30">
                    Delivered
                </Badge>
            );
        case "clicked":
            return (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/30">
                    Clicked
                </Badge>
            );
        case "failed":
            return <Badge variant="destructive">Failed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
