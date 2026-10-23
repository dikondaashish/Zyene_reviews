import { cn } from "@/lib/utils";
import type { AutomationsOverview, OverviewItem } from "@/services/automations/load-automations-overview";

function formatAt(at: string | null): string {
    if (!at) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(at));
}

const TONE_CLASS: Record<NonNullable<OverviewItem["tone"]>, string> = {
    good: "bg-success/10 text-success",
    bad: "bg-destructive/10 text-destructive",
    neutral: "bg-muted text-muted-foreground",
};

function ActivityList({ title, hint, items, empty }: { title: string; hint: string; items: OverviewItem[]; empty: string }) {
    return (
        <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
            <header className="border-b border-border px-4 py-3.5">
                <h3 className="ui-card-title text-foreground">
                    {title} <span className="font-normal tabular-nums text-muted-foreground">({items.length})</span>
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            </header>
            {items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>
            ) : (
                <ul className="divide-y divide-border">
                    {items.map((item) => (
                        <li key={item.id} className="px-4 py-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 truncate font-medium text-foreground">{item.title}</p>
                                <time className="shrink-0 text-xs tabular-nums text-muted-foreground" dateTime={item.at ?? undefined}>
                                    {formatAt(item.at)}
                                </time>
                            </div>
                            {item.detail ? (
                                item.tone ? (
                                    <span className={cn("mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", TONE_CLASS[item.tone])}>
                                        {item.detail}
                                    </span>
                                ) : (
                                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                                )
                            ) : null}
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
        <section aria-labelledby="automation-activity-title" className="space-y-4">
            <div>
                <h2 id="automation-activity-title" className="ui-section-title">Activity</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">What is about to go out, what went out, and what did not.</p>
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-3">
                <ActivityList title="Coming up" hint="Next 7 days" items={overview.upcoming} empty="Nothing scheduled in the next 7 days." />
                <ActivityList title="Recently sent" hint="Latest messages and whether they arrived" items={overview.recent} empty="No messages sent yet." />
                <ActivityList title="Did not go out" hint="Last 7 days" items={overview.failures} empty="No problems this week." />
            </div>
        </section>
    );
}
