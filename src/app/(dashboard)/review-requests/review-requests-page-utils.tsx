import { MessageSquare, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ReviewRequestRow {
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

export function getRequestStatus(
    opened_at: string | null,
    clicked_at: string | null,
    completed_at: string | null
): string {
    if (completed_at) return "converted";
    if (clicked_at) return "clicked";
    if (opened_at) return "opened";
    return "pending";
}

export function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
        pending: { label: "Pending", variant: "outline" },
        opened: { label: "Opened", variant: "secondary" },
        clicked: { label: "Clicked", variant: "default" },
        converted: { label: "Converted", variant: "default" },
    };
    const config_item = config[status] || config.pending;
    return <Badge variant={config_item.variant}>{config_item.label}</Badge>;
}

export function ChannelBadge({ channel }: { channel: string }) {
    const config: Record<string, { label: string; icon: typeof MessageSquare; color: string }> = {
        sms: {
            label: "SMS",
            icon: MessageSquare,
            color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
        },
        email: {
            label: "Email",
            icon: Mail,
            color: "bg-primary/10 text-primary",
        },
        both: {
            label: "Both",
            icon: MessageSquare,
            color: "bg-chart-4/15 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4",
        },
    };
    const config_item = config[channel] || config.email;
    if (channel === "both") {
        return (
            <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config_item.color}`}
            >
                <MessageSquare className="size-3" />
                <Mail className="size-3" />
                {config_item.label}
            </div>
        );
    }
    const IconComponent = config_item.icon;
    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config_item.color}`}>
            <IconComponent className="size-3" />
            {config_item.label}
        </div>
    );
}

export function getReviewRequestsTabUrl(status: string) {
    if (status === "all") return "/review-requests";
    return `/review-requests?status=${status}`;
}

export function formatReviewRequestContact(req: ReviewRequestRow) {
    if (req.channel === "sms") return req.customer_phone || "N/A";
    if (req.channel === "email") return req.customer_email || "N/A";
    return [req.customer_phone, req.customer_email].filter(Boolean).join(" · ") || "N/A";
}
