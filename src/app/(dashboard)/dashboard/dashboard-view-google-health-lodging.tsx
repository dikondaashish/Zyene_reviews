import Link from "next/link";
import { BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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
                <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div
                    className={`text-2xl font-bold ${
                        googleLodgingHealthScore === null
                            ? "text-muted-foreground"
                            : googleLodgingHealthScore >= 80
                              ? "text-chart-2"
                              : googleLodgingHealthScore >= 40
                                ? "text-chart-4"
                                : "text-destructive"
                    }`}
                >
                    {googleLodgingHealthScore !== null ? `${googleLodgingHealthScore}` : "—"}
                    {googleLodgingHealthScore !== null && (
                        <span className="text-lg font-semibold text-muted-foreground">/100</span>
                    )}
                </div>
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
