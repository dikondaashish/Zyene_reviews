import type { AutomationsOverview, OverviewItem } from "@/services/automations/load-automations-overview";

function formatAt(at: string | null): string {
    if (!at) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(at));
}

function ActivityList({ title, items, empty }: { title: string; items: OverviewItem[]; empty: string }) {
    return (
        <section className="rounded-lg border bg-card p-4">
            <h2 className="ui-section-title mb-3">{title}</h2>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{empty}</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                            <div className="min-w-0">
                                <p className="truncate">{item.title}</p>
                                {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
                            </div>
                            <time className="shrink-0 text-xs text-muted-foreground" dateTime={item.at ?? undefined}>{formatAt(item.at)}</time>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

/** Upcoming sends, recent messages (with delivery results) and failures from persisted data. */
export function AutomationsActivity({ overview }: { overview: AutomationsOverview }) {
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <ActivityList title="Upcoming" items={overview.upcoming} empty="Nothing scheduled in the next 7 days." />
            <ActivityList title="Recent messages" items={overview.recent} empty="No messages sent yet." />
            <ActivityList title="Failed or skipped (7 days)" items={overview.failures} empty="No failures this week." />
        </div>
    );
}
