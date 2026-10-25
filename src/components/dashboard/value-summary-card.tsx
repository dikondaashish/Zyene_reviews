import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, HeartHandshake, Link2, MessageSquareReply, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { valueTier, type ValueSummary, type ValueTier } from "@/lib/dashboard/value-summary";
import { CUSTOMERS_PER_REVIEW, type AverageSale, type ReviewValue } from "@/lib/dashboard/review-value";
import { ValueStory } from "@/components/dashboard/value-story";

const fmt = (n: number) => n.toLocaleString("en-US");

const TITLE: Record<ValueTier, (name: string) => string> = {
    strong: (name) => `You're on a roll, ${name}!`,
    growing: (name) => `Nice progress, ${name}!`,
    quiet: () => "Let's get your first win this month",
};

/** A quiet stat; the icon colour says what the win means. */
function Win({ icon: Icon, value, label, tone }: { icon: LucideIcon; value: number; label: string; tone: string }) {
    return (
        <li className="inline-flex items-center gap-1.5">
            <Icon className={cn("size-3.5", tone)} aria-hidden />
            <span className="font-semibold tabular-nums text-foreground">{fmt(value)}</span>
            {label}
        </li>
    );
}

/**
 * A short thank-you, then what this month's reviews are worth against the plan price, then
 * the month's other wins. Owners should see that Zyene pays for itself at a glance.
 */
export function ValueSummaryCard({
    businessId,
    businessName,
    monthLabel,
    summary: s,
    averageSale,
    reviewValue,
}: {
    businessId: string;
    businessName: string;
    monthLabel: string;
    summary: ValueSummary;
    averageSale: AverageSale;
    reviewValue: ReviewValue;
}) {
    const tier = valueTier(s);
    const wins = [
        { icon: Link2, value: s.linkVisits, label: "link visits", tone: "text-primary" },
        { icon: HeartHandshake, value: s.sentToGoogle, label: "sent to Google", tone: "text-success" },
        { icon: ShieldCheck, value: s.unhappyCaught, label: "caught privately", tone: "text-chart-5" },
        { icon: MessageSquareReply, value: s.zyeneReplies, label: "replies by Zyene", tone: "text-warning" },
    ];
    const estimate = averageSale.source === "category"
        ? "Typical sale for your type of business. Tap it to use yours."
        : `Estimate: 1 review ≈ ${CUSTOMERS_PER_REVIEW} customer`;

    return (
        <section
            aria-labelledby="value-summary-title"
            className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-card to-chart-2/10 p-4 sm:p-5"
        >
            <div className="flex items-start justify-between gap-3 sm:items-center">
                <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Sparkles className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h2 id="value-summary-title" className="ui-section-title text-foreground sm:truncate">{TITLE[tier](businessName)}</h2>
                        <p className="text-xs text-muted-foreground">Thanks for growing with Zyene this {monthLabel}.</p>
                    </div>
                </div>
                <Link
                    href={tier === "quiet" ? "/requests" : "/analytics?platform=zyene"}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                    {tier === "quiet" ? "Send a request" : "See results"}
                    <ArrowRight className="size-3.5" aria-hidden />
                </Link>
            </div>

            <div className="mt-4">
                <ValueStory
                    businessId={businessId}
                    newReviews={s.newReviews}
                    monthlyPrice={s.monthlyPrice}
                    averageSale={averageSale}
                    reviewValue={reviewValue}
                />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                {tier === "quiet" ? (
                    <p>Share your review link or QR code today. Happy customers go to Google, unhappy ones come to you.</p>
                ) : (
                    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Other wins this month">
                        {wins.map((win) => <Win key={win.label} {...win} />)}
                    </ul>
                )}
                <p>{estimate}</p>
            </div>
        </section>
    );
}
