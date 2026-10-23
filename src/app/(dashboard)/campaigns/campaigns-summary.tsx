import { cn } from "@/lib/utils";
import type { Campaign } from "./campaigns-list-types";
import { summarizeCampaigns } from "./campaign-presentation";

function Figure({ label, value, hint, emphasis }: { label: string; value: string; hint: string; emphasis?: boolean }) {
    return (
        <div className="min-w-0 bg-card px-5 py-4">
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className={cn("mt-1 text-2xl font-semibold tabular-nums tracking-tight", emphasis ? "text-warning-foreground" : "text-foreground")}>{value}</dd>
            <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd>
        </div>
    );
}

/** All campaigns rolled into the four numbers an owner asks about first. */
export function CampaignsSummary({ campaigns }: { campaigns: Campaign[] }) {
    const s = summarizeCampaigns(campaigns);
    const notRunning = [s.paused && `${s.paused} paused`, s.drafts && `${s.drafts} ${s.drafts === 1 ? "draft" : "drafts"}`].filter(Boolean).join(", ");
    return (
        <dl aria-label="All campaigns" className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 lg:grid-cols-4">
            <Figure
                label="Running"
                value={String(s.running)}
                hint={notRunning ? `Not running: ${notRunning}` : "Nothing paused or in draft"}
                emphasis={s.running === 0}
            />
            <Figure label="Customers asked" value={s.asked.toLocaleString("en-US")} hint="Across all campaigns" />
            <Figure
                label="Responded"
                value={`${s.responseRate}%`}
                hint={`${s.responded.toLocaleString("en-US")} left feedback or went to Google`}
            />
            <Figure label="Reviews you confirmed" value={s.confirmedReviews.toLocaleString("en-US")} hint="Marked as posted on the Requests page" />
        </dl>
    );
}
