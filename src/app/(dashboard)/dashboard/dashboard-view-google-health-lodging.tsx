import Link from "next/link";
import { BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ScoreGauge } from "@/components/dashboard/dashboard-mini-visuals";

type Props = {
    dict: Dictionary;
    googleLodgingHealthScore: number | null;
    googleLodgingApplicable: boolean | null;
};

export function DashboardViewGoogleHealthLodging({
    dict,
    googleLodgingHealthScore,
    googleLodgingApplicable,
}: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {dict.dashboard.lodging_completeness}
                </CardTitle>
                <BedDouble className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
                <ScoreGauge score={googleLodgingHealthScore} label={dict.dashboard.lodging_completeness} />
                <p className="mt-1 text-xs text-muted-foreground">
                    {googleLodgingHealthScore === null && googleLodgingApplicable === null
                        ? dict.dashboard.lodging_desc_empty
                        : dict.dashboard.lodging_desc}
                </p>
                <Link href="/settings/business-information" className="mt-3 inline-block">
                    <Button variant="outline" size="sm">
                        {dict.dashboard.lodging_details}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
