import Link from "next/link";
import { HelpCircle, Link2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardViewGoogleHealthLodging } from "./dashboard-view-google-health-lodging";
import type { DashboardViewProps } from "./types";

type Props = Pick<
    DashboardViewProps,
    | "dict"
    | "isGoogleConnected"
    | "useDemoData"
    | "showUnansweredQaCard"
    | "unansweredQaCount"
    | "brokenPlaceLinksCount"
    | "googleProfileHealthScore"
    | "showLodgingCard"
    | "googleLodgingHealthScore"
    | "googleLodgingApplicable"
    | "googleHealthMetricsGridClass"
>;

export function DashboardViewGoogleHealth({
    dict,
    isGoogleConnected,
    useDemoData,
    showUnansweredQaCard,
    unansweredQaCount,
    brokenPlaceLinksCount,
    googleProfileHealthScore,
    showLodgingCard,
    googleLodgingHealthScore,
    googleLodgingApplicable,
    googleHealthMetricsGridClass,
}: Props) {
    if (!isGoogleConnected && !useDemoData) {
        return null;
    }

    return (
        <div className={`grid gap-4 sm:grid-cols-2 ${googleHealthMetricsGridClass}`}>
            {showUnansweredQaCard && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dict.dashboard.unanswered_qa}
                        </CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${
                                unansweredQaCount === 0 ? "text-chart-2" : "text-chart-4"
                            }`}
                        >
                            {unansweredQaCount}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{dict.dashboard.qa_desc}</p>
                        <Link href="/questions" className="mt-3 inline-block">
                            <Button variant="outline" size="sm">
                                {dict.dashboard.manage_qa}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{dict.dashboard.broken_links}</CardTitle>
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${
                            brokenPlaceLinksCount === 0 ? "text-chart-2" : "text-destructive"
                        }`}
                    >
                        {brokenPlaceLinksCount}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{dict.dashboard.links_desc}</p>
                    <Link href="/settings/business-information" className="mt-3 inline-block">
                        <Button variant="outline" size="sm">
                            {dict.dashboard.manage_links}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {dict.dashboard.listing_completeness}
                    </CardTitle>
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${
                            googleProfileHealthScore === null
                                ? "text-muted-foreground"
                                : googleProfileHealthScore >= 80
                                  ? "text-chart-2"
                                  : googleProfileHealthScore >= 40
                                    ? "text-chart-4"
                                    : "text-destructive"
                        }`}
                    >
                        {googleProfileHealthScore !== null ? `${googleProfileHealthScore}` : "—"}
                        {googleProfileHealthScore !== null && (
                            <span className="text-lg font-semibold text-muted-foreground">/100</span>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{dict.dashboard.listing_desc}</p>
                    <Link href="/settings/business-information" className="mt-3 inline-block">
                        <Button variant="outline" size="sm">
                            {dict.dashboard.edit_listing}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            {showLodgingCard && (
                <DashboardViewGoogleHealthLodging
                    dict={dict}
                    googleLodgingHealthScore={googleLodgingHealthScore}
                    googleLodgingApplicable={googleLodgingApplicable}
                />
            )}
        </div>
    );
}
