import { Eye, Phone, Navigation2, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "dict" | "useDemoData" | "isGoogleConnected" | "googlePerf">;

export function DashboardViewGooglePerformance({
    dict,
    useDemoData,
    isGoogleConnected,
    googlePerf,
}: Props) {
    if (!(useDemoData || isGoogleConnected) || !googlePerf) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Google listing performance
                </h2>
                <span className="shrink-0 text-xs text-muted-foreground">Last 12 months</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profile views</CardTitle>
                        <Eye className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {googlePerf.profileViews.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Search + Maps impressions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Phone calls</CardTitle>
                        <Phone className="h-4 w-4 text-chart-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {googlePerf.callClicks.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Call button taps</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Direction requests</CardTitle>
                        <Navigation2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {googlePerf.directionRequests.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Route opens</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{dict.dashboard.website_clicks}</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {googlePerf.websiteClicks.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {dict.dashboard.website_clicks_desc}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
