import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Sparkles, Star, StarHalf } from "lucide-react";
import type { PublicLinkMetrics } from "@/lib/metrics/public-link-metrics";

/** Stats for public review link / QR visits. Every share is of visits, never of sent requests. */
export function RequestsLinkStatsSection({ stats }: { stats: PublicLinkMetrics }) {
    const cards = [
        {
            title: "Link visits",
            value: String(stats.visits),
            note: "Opened your review link or QR code",
            icon: Link2,
            border: "border-l-primary",
            iconClass: "text-primary",
        },
        {
            title: "Rated",
            value: `${stats.ratedRate.toFixed(1)}%`,
            note: `${stats.rated} of ${stats.visits} visits`,
            icon: StarHalf,
            border: "border-l-emerald-500",
            iconClass: "text-success",
        },
        {
            title: "Completed",
            value: `${stats.completionRate.toFixed(1)}%`,
            note: `${stats.completed} of ${stats.visits} visits`,
            icon: Sparkles,
            border: "border-l-amber-600",
            iconClass: "text-warning-foreground",
        },
        {
            title: "Google handoff",
            value: `${stats.googleHandoffRate.toFixed(1)}%`,
            note: `${stats.googleHandoff} sent to Google; publication unverified`,
            icon: Star,
            border: "border-l-yellow-500",
            iconClass: "text-warning",
        },
    ];

    return (
        <div className="@container mb-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 @3xl:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title} className={`border-l-4 ${card.border}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className={`size-4 ${card.iconClass}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.note}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
