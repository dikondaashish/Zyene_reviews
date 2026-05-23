"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2, RefreshCw } from "lucide-react";
import type { CompetitorRangeKey } from "@/lib/competitors/date-range";
import { AddCompetitorDialog } from "./add-competitor-dialog";
import type { Competitor } from "./competitors-types";

type CompetitorsListToolbarProps = {
    rangeOptions: Array<{ value: CompetitorRangeKey; label: string }>;
    optimisticRange: CompetitorRangeKey;
    setRange: (nextRange: CompetitorRangeKey) => void;
    competitors: Competitor[];
    syncWatchLoading: boolean;
    onSyncCompetitorWatch: () => void;
    businessId: string;
    onAddCompetitor: (newCompetitor: Competitor) => void;
};

export function CompetitorsListToolbar({
    rangeOptions,
    optimisticRange,
    setRange,
    competitors,
    syncWatchLoading,
    onSyncCompetitorWatch,
    businessId,
    onAddCompetitor,
}: CompetitorsListToolbarProps) {
    return (
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full min-w-0 items-stretch gap-1 rounded-lg border bg-muted/30 p-1 sm:max-w-md lg:w-fit lg:max-w-none lg:items-center">
                    {rangeOptions.map((opt) => {
                        const active = optimisticRange === opt.value;
                        return (
                            <Button
                                key={opt.value}
                                size="sm"
                                variant={active ? "default" : "ghost"}
                                className="min-w-0 flex-1 px-2 sm:px-3 lg:flex-none lg:px-3"
                                onClick={() => setRange(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        );
                    })}
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                    {competitors.length > 0 ? (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={syncWatchLoading}
                            className="w-full sm:w-auto"
                            onClick={() => void onSyncCompetitorWatch()}
                        >
                            {syncWatchLoading ? (
                                <Loader2 className="animate-spin md:mr-2 size-4" />
                            ) : (
                                <RefreshCw className="md:mr-2 size-4" />
                            )}
                            <span className="md:hidden">Sync</span>
                            <span className="hidden md:inline">Sync from Google</span>
                        </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                        <a
                            href={`/api/competitors/export?range=${optimisticRange}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center"
                        >
                            <Download className="md:mr-2 size-4" />
                            <span className="md:hidden">CSV</span>
                            <span className="hidden md:inline">Export CSV</span>
                        </a>
                    </Button>
                    <div className="col-span-2 w-full sm:col-span-1 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto">
                        <AddCompetitorDialog
                            businessId={businessId}
                            onSuccess={onAddCompetitor}
                        />
                    </div>
                </div>
            </div>
    );
}
