import { AlertTriangle, CheckCircle2, Flag, Mail, MessageSquare, MousePointerClick, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepFunnel } from "@/components/metrics/step-funnel";

type RequestsStats = {
    totalSent: number;
    delivered: number;
    clicked: number;
    reviews: number;
    emailSent: number;
    smsSent: number;
    totalFailed: number;
    deliveryRate: number;
    clickRate: number;
    conversionRate: number;
};

/** One funnel (sent → delivered → clicked → finished) instead of four tiles of "X of Y sent". */
export function RequestsStatsSection({ stats }: { stats: RequestsStats }) {
    return (
        <Card className="mb-8">
            <CardHeader className="pb-2">
                <CardTitle className="ui-card-title">From request to review</CardTitle>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Mail className="size-3.5" aria-hidden />{stats.emailSent} email</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="size-3.5" aria-hidden />{stats.smsSent} text</span>
                    {stats.totalFailed > 0 ? (
                        <span className="inline-flex items-center gap-1 text-destructive"><AlertTriangle className="size-3.5" aria-hidden />{stats.totalFailed} failed</span>
                    ) : null}
                </p>
            </CardHeader>
            <CardContent className="max-w-3xl">
                <StepFunnel
                    label="Review request funnel"
                    stages={[
                        { key: "sent", label: "Sent", value: stats.totalSent, icon: Send },
                        { key: "delivered", label: "Delivered", value: stats.delivered, icon: CheckCircle2 },
                        { key: "clicked", label: "Clicked the link", value: stats.clicked, icon: MousePointerClick },
                        {
                            key: "finished",
                            label: "Finished the review page",
                            value: stats.reviews,
                            icon: Flag,
                            hint: "Google doesn't tell us if they then posted, so confirm reviews in the list below.",
                        },
                    ]}
                />
            </CardContent>
        </Card>
    );
}
