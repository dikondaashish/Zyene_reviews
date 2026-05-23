import type { LucideIcon } from "lucide-react";
import { Mail, MessageSquare } from "lucide-react";

export interface Campaign {
    id: string;
    name: string;
    status: string;
    channel: string;
    trigger_type: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_completed: number;
    total_reviews_received: number;
    created_at: string;
}

export const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Active", variant: "default" },
    paused: { label: "Paused", variant: "secondary" },
    draft: { label: "Draft", variant: "outline" },
    completed: { label: "Completed", variant: "secondary" },
};

export const channelConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
    sms: { label: "SMS", icon: MessageSquare, color: "bg-chart-1/15 text-chart-1 dark:bg-chart-1/20 dark:text-chart-1" },
    email: { label: "Email", icon: Mail, color: "bg-primary/10 text-primary" },
    both: { label: "SMS + Email", icon: MessageSquare, color: "bg-chart-4/18 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4" },
};
