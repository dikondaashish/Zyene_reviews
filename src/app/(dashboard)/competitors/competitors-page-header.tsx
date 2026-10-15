import { PageHeader } from "@/components/dashboard/page-header";

export function CompetitorsPageHeader({ recentAlertsCount }: { recentAlertsCount: number }) {
    return (
        <PageHeader
            title="Competitor Monitoring"
            description="Keep track of your competitors' review performance to stay ahead."
            actionsClassName="w-full sm:w-auto"
            actions={recentAlertsCount > 0 ? (
                <a
                    href="#competitor-alerts"
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium hover:bg-muted/60 sm:w-fit sm:justify-start"
                >
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                        {recentAlertsCount}
                    </span>
                    Alerts in period
                </a>
            ) : null}
        />
    );
}
