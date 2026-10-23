import { ArrowDown, Eye, MousePointerClick, Navigation2, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listingFunnel, type ListingAction } from "@/lib/dashboard/dashboard-visuals";
import type { DashboardViewProps } from "./types";

type Props = Pick<DashboardViewProps, "useDemoData" | "isGoogleConnected" | "googlePerf">;

const ACTION_ICON: Record<ListingAction["key"], LucideIcon> = {
    calls: Phone,
    directions: Navigation2,
    website: MousePointerClick,
};

const fmt = (n: number) => n.toLocaleString("en-US");

/** Views on top, then what those viewers did: one funnel instead of four separate tiles. */
export function DashboardViewGooglePerformance({ useDemoData, isGoogleConnected, googlePerf }: Props) {
    if (!(useDemoData || isGoogleConnected) || !googlePerf) {
        return null;
    }
    const funnel = listingFunnel(googlePerf);

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <h2 className="ui-section-title">Google listing performance</h2>
                <span className="shrink-0 text-xs text-muted-foreground">Last 12 months</span>
            </div>
            <Card>
                <CardContent className="grid gap-6 pt-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Eye className="size-5" aria-hidden />
                            </span>
                            <div>
                                <p className="text-3xl font-bold tabular-nums">{fmt(funnel.views)}</p>
                                <p className="text-xs text-muted-foreground">views of your listing on Search and Maps</p>
                            </div>
                        </div>
                        <ArrowDown className="ml-3 size-4 text-muted-foreground" aria-hidden />
                        <div className="flex items-baseline gap-2 rounded-lg bg-success/10 px-3 py-2 text-success">
                            <span className="text-xl font-bold tabular-nums">{fmt(funnel.totalActions)}</span>
                            <span className="text-sm font-semibold">
                                actions
                                {funnel.actionRate !== null ? ` (${funnel.actionRate.toFixed(funnel.actionRate < 10 ? 1 : 0)}% of views)` : ""}
                            </span>
                        </div>
                    </div>

                    <ul className="space-y-4" aria-label="What viewers did on your listing">
                        {funnel.actions.map((a) => {
                            const Icon = ACTION_ICON[a.key];
                            return (
                                <li key={a.key} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="flex items-center gap-2 font-medium">
                                            <Icon className="size-4 text-primary" aria-hidden />
                                            {a.label}
                                        </span>
                                        <span className="font-semibold tabular-nums">{fmt(a.count)}</span>
                                    </div>
                                    <div aria-hidden className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${a.widthPct}%` }} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
