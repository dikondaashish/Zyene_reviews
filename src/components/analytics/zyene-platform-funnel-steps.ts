import {
    CheckCircle2,
    Eye,
    MousePointer2,
    Send,
    Sparkles,
    Star,
} from "lucide-react";

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
            label: "Posted to Google",
            count: base.totalPostedToGoogle,
            icon: Star,
            color: "var(--chart-2)",
        },
    ];
}
