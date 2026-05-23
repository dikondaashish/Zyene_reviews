export function IntegrationsSectionHeader({
    title,
    description,
    icon: Icon,
    badge,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    badge?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            {badge}
        </div>
    );
}

export function IntegrationsStatusBadge({ count, label }: { count: number; label: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                count > 0
                    ? "bg-chart-2/15 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2"
                    : "bg-muted text-muted-foreground"
            }`}
        >
            {count > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-chart-2/100 animate-pulse" />
            )}
            {count} {label}
        </span>
    );
}
