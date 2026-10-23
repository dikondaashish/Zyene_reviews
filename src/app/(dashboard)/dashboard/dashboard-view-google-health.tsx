import Link from "next/link";
import { HelpCircle, Link2, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/dashboard/dashboard-mini-visuals";
import { CountStatus } from "./dashboard-view-count-status";
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
                        <HelpCircle className="text-muted-foreground size-4" />
                    </CardHeader>
                    <CardContent>
                        <CountStatus count={unansweredQaCount} okLabel="All answered" problemTone="ok" />
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
                    <Link2 className="text-muted-foreground size-4" />
                </CardHeader>
                <CardContent>
                    <CountStatus count={brokenPlaceLinksCount} okLabel="All working" problemTone="bad" />
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
                    <ListChecks className="text-muted-foreground size-4" />
                </CardHeader>
                <CardContent>
                    <ScoreGauge score={googleProfileHealthScore} label={dict.dashboard.listing_completeness} />
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
