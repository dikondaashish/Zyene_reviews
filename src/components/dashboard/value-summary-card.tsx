import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, HeartHandshake, MessageSquareReply, ShieldCheck, Star } from "lucide-react";
import { HOURLY_RATE_USD, MINUTES_PER_REPLY, MINUTES_PER_REQUEST, type ValueSummary } from "@/lib/dashboard/value-summary";

const fmt = (n: number) => n.toLocaleString("en-US");
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 10 ? 2 : 0 });
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;

function Tile({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: ReactNode }) {
    return (
        <div className="min-w-0 bg-card px-5 py-4 sm:px-6">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">{icon}{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
        </div>
    );
}

/** One sentence of what Zyene achieved, built from the biggest wins only. */
function headline(s: ValueSummary): string {
    const wins = [
        s.sentToGoogle > 0 && `sent ${plural(s.sentToGoogle, "happy customer", "happy customers")} to your Google page`,
        s.unhappyCaught > 0 && `caught ${plural(s.unhappyCaught, "unhappy customer", "unhappy customers")} before they posted publicly`,
        s.zyeneReplies > 0 && `replied to ${plural(s.zyeneReplies, "review", "reviews")} for you`,
        s.sentToGoogle === 0 && s.requestsSent > 0 && `asked ${plural(s.requestsSent, "customer", "customers")} for a review`,
    ].filter(Boolean) as string[];
    if (wins.length === 0) return "";
    const list = wins.length === 1 ? wins[0] : `${wins.slice(0, -1).join(", ")} and ${wins[wins.length - 1]}`;
    return `This month Zyene ${list}.`;
}

/**
 * "Is this worth what I pay?" The month's results first, then the price next to them, so the
 * owner sees value before cost. Dollar figures are estimates and say how they were made.
 */
export function ValueSummaryCard({ summary, monthLabel }: { summary: ValueSummary; monthLabel: string }) {
    const s = summary;
    const change = s.newReviewsChange;
    const hours = s.hoursSaved >= 10 ? Math.round(s.hoursSaved) : Math.round(s.hoursSaved * 10) / 10;

    return (
        <section aria-labelledby="value-summary-title" className="overflow-hidden rounded-xl border bg-card">
            <header className="flex items-start justify-between gap-3 border-b border-border bg-primary/5 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                    <h2 id="value-summary-title" className="ui-section-title">Your Zyene results · {monthLabel}</h2>
                    <p className="mt-0.5 text-sm text-foreground">
                        {headline(s) || "Nothing yet this month. Share your review link or send a request to start collecting reviews."}
                    </p>
                </div>
                <Link href="/analytics?platform=zyene" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
                    Details<ArrowRight className="size-3.5" aria-hidden />
                </Link>
            </header>
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
                <Tile
                    icon={<HeartHandshake className="size-3.5 text-success" aria-hidden />}
                    label="Sent to Google"
                    value={fmt(s.sentToGoogle)}
                    note={`Happy customers who went on to your Google review page · ${plural(s.linkVisits, "link visit", "link visits")}, ${plural(s.requestsSent, "request", "requests")} sent`}
                />
                <Tile
                    icon={<Star className="size-3.5 text-warning" aria-hidden />}
                    label="New reviews"
                    value={fmt(s.newReviews)}
                    note={
                        <span className={change > 0 ? "text-success" : undefined}>
                            {change === 0 ? "Same as last month" : `${change > 0 ? "+" : ""}${fmt(change)} vs last month`}
                        </span>
                    }
                />
                <Tile
                    icon={<ShieldCheck className="size-3.5 text-primary" aria-hidden />}
                    label="Caught privately"
                    value={fmt(s.unhappyCaught)}
                    note="Unhappy customers who told you, not Google"
                />
                <Tile
                    icon={<MessageSquareReply className="size-3.5 text-primary" aria-hidden />}
                    label="Replies by Zyene"
                    value={fmt(s.zyeneReplies)}
                    note="Review replies written and posted through Zyene"
                />
            </div>
            <ValueFooter summary={s} hours={hours} />
        </section>
    );
}

function ValueFooter({ summary: s, hours }: { summary: ValueSummary; hours: number }) {
    if (s.monthlyPrice === null && s.hoursSaved <= 0) return null;
    const assumptions = `Estimate: ${MINUTES_PER_REPLY} min per reply and ${MINUTES_PER_REQUEST} min per request you'd otherwise do by hand, at $${HOURLY_RATE_USD}/hr.`;
    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-5 py-3 text-xs sm:px-6">
            {s.monthlyPrice === 0 && (
                <span className="text-muted-foreground">
                    You&apos;re on a free period right now: every result above cost you <span className="font-semibold text-success">$0</span>
                </span>
            )}
            {s.monthlyPrice !== null && s.monthlyPrice > 0 && (
                <span className="text-muted-foreground">
                    You pay <span className="font-semibold text-foreground">{usd(s.monthlyPrice)}/mo</span>
                    {s.costPerGoogleCustomer !== null && (
                        <>
                            {" "}· that&apos;s <span className="font-semibold text-success">{usd(s.costPerGoogleCustomer)}</span> per customer sent to Google
                        </>
                    )}
                </span>
            )}
            {s.hoursSaved > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground" title={assumptions}>
                    <Clock className="size-3.5" aria-hidden />
                    About <span className="font-semibold text-foreground">{hours} hrs</span> saved
                    (≈ <span className="font-semibold text-foreground">{usd(s.timeValueUsd)}</span> of your time)
                </span>
            )}
        </div>
    );
}
