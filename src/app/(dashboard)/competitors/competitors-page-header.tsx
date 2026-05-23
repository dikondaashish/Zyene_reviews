export function CompetitorsPageHeader({ recentAlertsCount }: { recentAlertsCount: number }) {
    return (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">Competitor Monitoring</h2>
                <p className="text-sm text-muted-foreground lg:text-base">
                    Keep track of your competitors&apos; review performance to stay ahead.
                </p>
            </div>
            {recentAlertsCount > 0 ? (
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
        </div>
    );
}
