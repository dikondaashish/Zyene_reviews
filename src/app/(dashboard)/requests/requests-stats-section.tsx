import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Send, CheckCircle2, MousePointerClick, Star } from "lucide-react";

export function RequestsStatsSection({
    stats,
}: {
    stats: {
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
}) {
    return (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                    <Send className="text-primary size-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSent}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.emailSent} email · {stats.smsSent} SMS
                        {stats.totalFailed > 0 ? (
                            <span className="text-destructive"> · {stats.totalFailed} failed</span>
                        ) : null}
                    </p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                    <CheckCircle2 className="text-chart-2 size-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">{stats.delivered} delivered</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-600">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                    <MousePointerClick className="text-chart-4 size-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.clickRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">{stats.clicked} clicks</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Review Conversion</CardTitle>
                    <Star className="text-chart-4 size-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">{stats.reviews} completed</p>
                </CardContent>
            </Card>
        </div>
    );
}
