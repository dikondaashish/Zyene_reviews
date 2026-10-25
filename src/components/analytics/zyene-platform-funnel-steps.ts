import {
    CheckCircle2,
    Eye,
    Link2,
    MousePointer2,
    Send,
    Sparkles,
    Star,
} from "lucide-react";
import type { PublicLinkMetrics } from "@/lib/metrics/public-link-metrics";

/** Public link / QR visits: no send step, so every share is of visits. */
export function buildZyenePlatformLinkFunnelSteps(link: PublicLinkMetrics) {
    return [
        { label: "Visits", count: link.visits, icon: Link2, color: "var(--primary)" },
        { label: "Rated", count: link.rated, icon: Star, color: "var(--primary)" },
        { label: "Completed", count: link.completed, icon: Sparkles, color: "var(--chart-5)" },
        { label: "Google handoff", count: link.googleHandoff, icon: Star, color: "var(--chart-2)" },
    ];
}

export function buildZyenePlatformFunnelSteps(base: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalCompleted: number;
    totalPostedToGoogle: number;
}) {
    return [
        { label: "Sent", count: base.totalSent, icon: Send, color: "var(--primary)" },
        {
            label: "Delivered",
            count: base.totalDelivered,
            icon: CheckCircle2,
            color: "var(--primary)",
        },
        { label: "Opened", count: base.totalOpened, icon: Eye, color: "var(--primary)" },
        {
            label: "Link Clicked",
            count: base.totalClicked,
            icon: MousePointer2,
            color: "var(--primary)",
        },
        {
            label: "Completed",
            count: base.totalCompleted,
            icon: Sparkles,
            color: "var(--chart-5)",
        },
        {
            label: "Google handoff",
            count: base.totalPostedToGoogle,
            icon: Star,
            color: "var(--chart-2)",
        },
    ];
}
